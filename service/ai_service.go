package service

import (
	"a21hc3NpZ25tZW50/model"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

type AIService struct {
	Client HTTPClient
}

func (s *AIService) AnalyzeData(table map[string][]string, query, token string) (string, error) {

	if len(table) == 0 {
		return "", fmt.Errorf("table cannot be empty")
	}

	payload := map[string]interface{}{
		"inputs": map[string]interface{}{
			"query": query,
			"table": table,
		},
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal payload: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api-inference.huggingface.co/models/google/tapas-large-finetuned-wtq", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("received non-200 response: %s", resp.Status)
	}

	var tapasResponse model.TapasResponse
	if err := json.NewDecoder(resp.Body).Decode(&tapasResponse); err != nil {
		return "", fmt.Errorf("failed to decode response: %v", err)
	}

	fmt.Printf("API response: %+v\n", tapasResponse)

	if tapasResponse.Answer == "" && len(tapasResponse.Cells) > 0 {
		return tapasResponse.Cells[0], nil
	}
	return tapasResponse.Answer, nil // TODO: replace this
}

func (s *AIService) ChatWithAI(context, query, token string) (model.ChatResponse, error) {
	payload := map[string]interface{}{
		"inputs": fmt.Sprintf("%s %s", context, query),
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return model.ChatResponse{}, fmt.Errorf("failed to marshal payload: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api-inference.huggingface.co/models/microsoft/Phi-3.5-mini-instruct", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return model.ChatResponse{}, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return model.ChatResponse{}, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return model.ChatResponse{}, fmt.Errorf("received non-200 response: %s", resp.Status)
	}

	var chatResponse []model.ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResponse); err != nil {
		return model.ChatResponse{}, fmt.Errorf("failed to decode response: %v", err)
	}

 	if len(chatResponse) > 0 {
		return chatResponse[0], nil
	}

	return model.ChatResponse{}, fmt.Errorf("no response")
}// TODO: answer here
