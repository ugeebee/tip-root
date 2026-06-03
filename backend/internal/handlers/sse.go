package handlers

import (
	"fmt"
	"net/http"

	"github.com/ugeebee/root-pay/backend/internal/sse"
)

// SSEWait holds the HTTP connection open until the payment clears.
func SSEWait(w http.ResponseWriter, r *http.Request) {
	serverKey := r.URL.Query().Get("server_key")
	if serverKey == "" || len(serverKey) != 32 {
		http.Error(w, "Invalid or missing server_key", http.StatusBadRequest)
		return
	}

	// 1. Set the headers in memory
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	// 2. Verify streaming is supported
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported by server", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	flusher.Flush()

	// 5. Now register the viewer in the switchboard
	msgChan := sse.PaymentHub.Register(serverKey)
	defer sse.PaymentHub.Unregister(serverKey)

	// 6. The Wait Loop
	for {
		select {
		case msg, ok := <-msgChan:
			if !ok {
				return
			}

			// Handle Heartbeats
			if len(msg) > 0 && msg[0] == ':' {
				fmt.Fprint(w, msg)
				flusher.Flush()
				continue
			}

			// Handle Actual Payments
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
			return

		case <-r.Context().Done():
			fmt.Println("Viewer disconnected:", serverKey)
			return
		}
	}
}
