package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/ugeebee/root-pay/backend/internal/database"
	"github.com/ugeebee/root-pay/backend/internal/eventbus"
	"github.com/ugeebee/root-pay/backend/internal/handlers"
	"github.com/ugeebee/root-pay/backend/internal/models"

	goaway "github.com/TwiN/go-away"
	"github.com/nats-io/nats.go"
)

type IngestionServer struct {
	nc *nats.Conn
}

type IncomingProxyPayload struct {
	ClientKey string `json:"client_key"`
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	database.InitDB()

	server := &IngestionServer{
		nc: eventbus.Connect(),
	}
	defer server.nc.Close()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://xyz.com"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.Route("/api", func(r chi.Router) {
		// 1. The Frontend creates the tip here
		r.Post("/tips", handlers.CreateTip)

		// 2. Razorpay/Proxy sends the payment success here
		r.Post("/webhooks/upi", server.handleProxyWebhook)

		// 3. Support Tickets
		r.Post("/support", handlers.SubmitSupportTicket)
	})

	log.Println("Ingestion API Service listening on :8080...")
	log.Fatal(http.ListenAndServe(":8081", r))
}

func (s *IngestionServer) handleProxyWebhook(w http.ResponseWriter, r *http.Request) {
	var req IncomingProxyPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	tipRecord, err := database.ProcessWebhookTip(req.ClientKey)
	if err != nil {
		log.Printf("Tip not found or already processed: %s", req.ClientKey)
		w.WriteHeader(http.StatusOK)
		return
	}

	isNSFW := goaway.IsProfane(tipRecord.Name) || goaway.IsProfane(tipRecord.Message)
	_ = database.UpdateNSFWFlag(req.ClientKey, isNSFW)

	event := models.TipEvent{
		ClientKey:  req.ClientKey,
		StreamerID: tipRecord.StreamerID,
		Name:       tipRecord.Name,
		Amount:     tipRecord.Amount,
		Message:    tipRecord.Message,
		IsNSFW:     isNSFW,
		Timestamp:  time.Now(),
	}

	eventData, _ := json.Marshal(event)

	if err := s.nc.Publish("tips.processed", eventData); err != nil {
		log.Printf("Failed to publish to NATS: %v", err)
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"processed and published"}`))
}
