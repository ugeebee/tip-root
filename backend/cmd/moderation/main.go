package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/nats-io/nats.go"
	"github.com/ugeebee/tip-root/backend/internal/database"
	"github.com/ugeebee/tip-root/backend/internal/discord"
	"github.com/ugeebee/tip-root/backend/internal/eventbus"
	"github.com/ugeebee/tip-root/backend/internal/llm"
	"github.com/ugeebee/tip-root/backend/internal/logger"
	"github.com/ugeebee/tip-root/backend/internal/models"
)

func main() {
	logger.InitLogger()
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	// Initialize the database connection so we can update the NSFW flag
	database.InitDB()

	nc, js := eventbus.Connect()
	defer nc.Close()

	_, err := js.Subscribe("tips.ingested", func(m *nats.Msg) {
		defer m.Ack()
		var event models.TipEvent
		if err := json.Unmarshal(m.Data, &event); err != nil {
			log.Printf("[MODERATION] Error unmarshaling event: %v", err)
			return
		}

		// 1. If it wasn't flagged by goaway (in ingestion service), run it through Gemini
		if !event.IsNSFW {
			isNSFW := llm.CheckProfanity(event.Name, event.Message)
			if isNSFW {
				event.IsNSFW = true
				_ = database.UpdateNSFWFlag(event.ClientKey, true)
				log.Printf("[MODERATION] Gemini flagged tip as NSFW: %s", event.ClientKey)
			}
		}

		// 2. If it's flagged (either by goaway or gemini), send to Discord alert
		if event.IsNSFW {
			log.Printf("[MODERATION] Flagged tip routed to Discord: %s", event.ClientKey)

			warningMsg := fmt.Sprintf("**NSFW Tip Blocked!**\nUser: %s\nAmount: %.2f\nMessage: %s",
				event.Name, event.Amount, event.Message)

			discord.SendMessage(warningMsg)
		}

		// 3. Publish to tips.processed so downstream services (OBS, Dashboard) can pick it up
		eventData, _ := json.Marshal(event)
		if _, err := js.Publish("tips.processed", eventData); err != nil {
			log.Printf("[MODERATION] Failed to publish to tips.processed: %v", err)
		} else {
			log.Printf("[MODERATION] Successfully processed and published tip: %s", event.ClientKey)
		}

	}, nats.Durable("moderation-service"), nats.ManualAck())

	if err != nil {
		log.Fatalf("NATS Subscription failed: %v", err)
	}

	log.Println("Moderation Service listening on NATS subject 'tips.ingested'...")

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan
}
