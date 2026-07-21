package llm

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type ModerationResult struct {
	IsNSFW bool `json:"is_nsfw"`
}

func CheckProfanity(name, message string) bool {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("[Gemini] API Key missing, skipping check and failing open (clean)")
		return false
	}

	// Fast timeout so we don't block the event bus queue for too long
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Printf("[Gemini] Failed to create SDK client: %v", err)
		return false
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	model.ResponseMIMEType = "application/json"
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text("You are a strict moderation assistant. Analyze the following tip (Name and Message). It may be in English, Hindi, or Hinglish. Determine if it contains profanity, sexual content, targeted harassment, or attempts to bypass filters using symbols/misspellings. Return a JSON object with a single boolean field 'is_nsfw'. True if it is bad, false if it is completely clean."),
		},
	}

	userText := "Name: " + name + "\nMessage: " + message
	resp, err := model.GenerateContent(ctx, genai.Text(userText))
	if err != nil {
		log.Printf("[Gemini] API request failed: %v", err)
		return false
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		log.Println("[Gemini] No candidates returned from API")
		return false
	}

	part := resp.Candidates[0].Content.Parts[0]
	textResponse, ok := part.(genai.Text)
	if !ok {
		log.Printf("[Gemini] Unexpected response format from SDK")
		return false
	}

	var modResult ModerationResult
	if err := json.Unmarshal([]byte(string(textResponse)), &modResult); err != nil {
		log.Printf("[Gemini] Error parsing JSON output: %v, text: %s", err, string(textResponse))
		return false
	}

	return modResult.IsNSFW
}
