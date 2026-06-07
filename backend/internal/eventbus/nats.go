package eventbus

import (
	"log"
	"os"

	"github.com/nats-io/nats.go"
)

func Connect() (*nats.Conn, nats.JetStreamContext) {
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = nats.DefaultURL
	}

	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatalf("Fatal NATS Connection error: %v", err)
	}

	js, err := nc.JetStream()
	if err != nil {
		log.Fatalf("Fatal JetStream Initialization error: %v", err)
	}

	streamName := "TIPS_STREAM"
	_, err = js.StreamInfo(streamName)
	if err != nil {
		_, err = js.AddStream(&nats.StreamConfig{
			Name:     streamName,
			Subjects: []string{"tips.>"},
		})
		if err != nil {
			log.Fatalf("Failed to create JetStream stream: %v", err)
		}
	}

	return nc, js
}
