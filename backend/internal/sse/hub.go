package sse

import (
	"sync"
	"time"
)

type Hub struct {
	clients map[string]chan string
	mu      sync.RWMutex
}

var PaymentHub *Hub

func InitHub() {
	PaymentHub = &Hub{
		clients: make(map[string]chan string),
	}
	go PaymentHub.startHeartbeatWorker()
}

func (h *Hub) startHeartbeatWorker() {
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		h.mu.RLock()
		for _, ch := range h.clients {
			select {
			case ch <- ": keepalive\n\n":
			default:
			}
		}
		h.mu.RUnlock()
	}
}

func (h *Hub) Register(clientKey string) chan string {
	h.mu.Lock()
	defer h.mu.Unlock()

	if oldChan, exists := h.clients[clientKey]; exists {
		close(oldChan)
	}

	newChan := make(chan string, 5)
	h.clients[clientKey] = newChan

	return newChan
}

func (h *Hub) Unregister(clientKey string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if ch, exists := h.clients[clientKey]; exists {
		close(ch)
		delete(h.clients, clientKey)
	}
}

func (h *Hub) Publish(clientKey string, message string) bool {
	h.mu.RLock()
	ch, exists := h.clients[clientKey]
	h.mu.RUnlock()

	if !exists {
		return false
	}

	select {
	case ch <- message:
		return true
	default:
		return false
	}
}
