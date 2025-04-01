package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func analyzePatientData(c *fiber.Ctx) error {
	req := new(AnalysisRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// patient data based on type
	var data interface{}
	var err error

	switch req.DataType {
	case "metrics":
		var metrics []HealthMetric
		err = db.Where("patient_id = ?", req.PatientID).Find(&metrics).Error
		data = metrics
	case "medications":
		var medications []Medication
		err = db.Where("patient_id = ?", req.PatientID).Find(&medications).Error
		data = medications
	case "appointments":
		var appointments []Appointment
		err = db.Where("patient_id = ?", req.PatientID).Find(&appointments).Error
		data = appointments
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Invalid data type"})
	}

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GENAI_API_KEY")))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create AI client"})
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")

	dataJSON, err := json.Marshal(data)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to serialize data"})
	}

	prompt := fmt.Sprintf("You are a medical analysis assistant. Please analyze the following %s data for patient ID %s and provide a concise medical summary:\n\n%s",
		req.DataType, req.PatientID, string(dataJSON))

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	summary := ""
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				if text, ok := part.(genai.Text); ok {
					summary += string(text)
				}
			}
		}
	}

	analysis := AnalysisResponse{
		Data:    data,
		Summary: summary,
	}

	return c.JSON(analysis)
}
