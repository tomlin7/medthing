package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"
	"log"
	"strings"
	
	"github.com/gofiber/fiber/v2"
	"github.com/google/generative-ai-go/genai"
	"github.com/google/uuid"
	"google.golang.org/api/option"
)

// ReportResponse is the structured data sent to frontend
type ReportResponse struct {
	ID             string           `json:"id"`
	PatientID      string           `json:"patientId"`
	PatientName    string           `json:"patientName"`
	PatientInfo    PatientInfo      `json:"patientInfo"`
	ReportType     string           `json:"reportType"`
	Summary        string           `json:"summary"`
	Sections       []ReportSection  `json:"sections"`
	Recommendations []string        `json:"recommendations"`
	GeneratedAt    time.Time        `json:"generatedAt"`
	Status         string           `json:"status"`
}

type PatientInfo struct {
	Age        int    `json:"age"`
	Gender     string `json:"gender"`
	DateOfBirth string `json:"dateOfBirth"`
}

type ReportSection struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

// func analyzePatientData(c *fiber.Ctx) error {
// 	req := new(AnalysisRequest)
// 	if err := c.BodyParser(req); err != nil {
// 		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
// 	}

// 	// patient data based on type
// 	var data interface{}
// 	var err error

// 	switch req.DataType {
// 	case "metrics":
// 		var metrics []HealthMetric
// 		err = db.Where("patient_id = ?", req.PatientID).Find(&metrics).Error
// 		data = metrics
// 	case "medications":
// 		var medications []Medication
// 		err = db.Where("patient_id = ?", req.PatientID).Find(&medications).Error
// 		data = medications
// 	case "appointments":
// 		var appointments []Appointment
// 		err = db.Where("patient_id = ?", req.PatientID).Find(&appointments).Error
// 		data = appointments
// 	default:
// 		return c.Status(400).JSON(fiber.Map{"error": "Invalid data type"})
// 	}

// 	if err != nil {
// 		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
// 	}

// 	ctx := context.Background()
// 	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GENAI_API_KEY")))
// 	if err != nil {
// 		return c.Status(500).JSON(fiber.Map{"error": "Failed to create AI client"})
// 	}
// 	defer client.Close()

// 	model := client.GenerativeModel("gemini-1.5-flash")

// 	dataJSON, err := json.Marshal(data)
// 	if err != nil {
// 		return c.Status(500).JSON(fiber.Map{"error": "Failed to serialize data"})
// 	}

// 	prompt := fmt.Sprintf("You are a medical analysis assistant. Please analyze the following %s data for patient ID %s and provide a concise medical summary:\n\n%s",
// 		req.DataType, req.PatientID, string(dataJSON))

// 	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
// 	if err != nil {
// 		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
// 	}

// 	summary := ""
// 	for _, cand := range resp.Candidates {
// 		if cand.Content != nil {
// 			for _, part := range cand.Content.Parts {
// 				if text, ok := part.(genai.Text); ok {
// 					summary += string(text)
// 				}
// 			}
// 		}
// 	}

// 	analysis := AnalysisResponse{
// 		Data:    data,
// 		Summary: summary,
// 	}

// 	return c.JSON(analysis)
// }

// Function to generate a comprehensive medical report for a patient
func generateMedicalReport(c *fiber.Ctx) error {
	// Parse request body
	req := new(struct {
		PatientID string `json:"patientId"`
	})
	
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}
	
	// Fetch patient data
	var patient Patient
	if err := db.First(&patient, "id = ?", req.PatientID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Patient not found",
		})
	}
	
	// Create a report record with pending status
	reportID := uuid.New()
	report := Report{
		ID:          reportID,
		PatientID:   patient.ID,
		PatientName: patient.Name,
		ReportType:  "Comprehensive Health Assessment",
		Status:      "processing",
		GeneratedAt: time.Now(),
	}
	
	if err := db.Create(&report).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create report",
		})
	}
	
	// Start AI report generation in a goroutine
	go generateReportContent(reportID.String(), patient)
	
	// Return the report ID immediately
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Report generation started",
		"data": fiber.Map{
			"id": reportID,
		},
	})
}

// Background function to generate the actual report content
func generateReportContent(reportID string, patient Patient) {
	ctx := context.Background()
	apiKey := os.Getenv("GENAI_API_KEY")
	if apiKey == "" {
		log.Printf("ERROR: ReportID %s: GENAI_API_KEY environment variable not set.", reportID)
		updateReportStatus(reportID, "failed", "API key not configured", "")
		return
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		// Log the specific error
		log.Printf("ERROR: ReportID %s: Failed to create GenAI client: %v", reportID, err)
		updateReportStatus(reportID, "failed", "Failed to initialize AI client", "")
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash") // Use recommended model like 1.5 Flash or Pro
	model.SetTemperature(0.2)

	// Fetch patient's health data with error checking
	var medications []Medication
	var appointments []Appointment
	var metrics []HealthMetric

	if err := db.Where("patient_id = ?", patient.ID).Find(&medications).Error; err != nil {
		log.Printf("ERROR: ReportID %s: Failed to fetch medications for patient %d: %v", reportID, patient.ID, err)
		updateReportStatus(reportID, "failed", "Database error fetching medications", "")
		return
	}
	if err := db.Where("patient_id = ?", patient.ID).Find(&appointments).Error; err != nil {
		log.Printf("ERROR: ReportID %s: Failed to fetch appointments for patient %d: %v", reportID, patient.ID, err)
		updateReportStatus(reportID, "failed", "Database error fetching appointments", "")
		return
	}
	if err := db.Where("patient_id = ?", patient.ID).Find(&metrics).Error; err != nil {
		log.Printf("ERROR: ReportID %s: Failed to fetch metrics for patient %d: %v", reportID, patient.ID, err)
		updateReportStatus(reportID, "failed", "Database error fetching metrics", "")
		return
	}


	// Convert data to JSON for the AI prompt, check errors
	patientJSON, err := json.MarshalIndent(patient, "", "  ") // Use MarshalIndent for readability if needed
	if err != nil {
		log.Printf("ERROR: ReportID %s: Failed to marshal patient data: %v", reportID, err)
		updateReportStatus(reportID, "failed", "Internal error processing patient data", "")
		return
	}
	medicationsJSON, err := json.MarshalIndent(medications, "", "  ")
	if err != nil {
		log.Printf("ERROR: ReportID %s: Failed to marshal medications data: %v", reportID, err)
		updateReportStatus(reportID, "failed", "Internal error processing medication data", "")
		return
	}
	appointmentsJSON, err := json.MarshalIndent(appointments, "", "  ")
	if err != nil {
		log.Printf("ERROR: ReportID %s: Failed to marshal appointments data: %v", reportID, err)
		updateReportStatus(reportID, "failed", "Internal error processing appointment data", "")
		return
	}
	metricsJSON, err := json.MarshalIndent(metrics, "", "  ")
	if err != nil {
		log.Printf("ERROR: ReportID %s: Failed to marshal metrics data: %v", reportID, err)
		updateReportStatus(reportID, "failed", "Internal error processing health metrics", "")
		return
	}

	// Create comprehensive prompt
	prompt := fmt.Sprintf(`You are an experienced medical professional generating a comprehensive health report.
Generate a detailed medical report for the following patient based on their data.

PATIENT INFORMATION:
%s

MEDICATIONS:
%s

APPOINTMENT HISTORY:
%s

HEALTH METRICS:
%s

Format the report STRICTLY as a JSON object with the following structure ONLY. Do NOT include any text before or after the JSON object (like 'Here is the JSON:' or markdown fences).
{
	"summary": "Executive summary of patient's health (1-2 paragraphs)",
	"sections": [
		{
			"title": "Section Title",
			"content": "Detailed HTML content string with findings and analysis"
		},
		{
			"title": "Another Section Title",
			"content": "More HTML content..."
		}
	],
	"recommendations": [
		"Recommendation 1 as a string",
		"Recommendation 2 as a string"
	]
}

Make the report professional and evidence-based.
Ensure 'content' fields contain valid HTML strings.
Include at least 3-5 detailed sections and 3-5 specific recommendations.
Generate ONLY the JSON object as requested.`,
		string(patientJSON),
		string(medicationsJSON),
		string(appointmentsJSON),
		string(metricsJSON))
	
	log.Printf("INFO: ReportID %s: Sending prompt to Gemini for patient %d.", reportID, patient.ID)
	// Optional: Log the prompt length or even the prompt itself for debugging (be mindful of sensitive data)
	// log.Printf("DEBUG: ReportID %s: Prompt length: %d", reportID, len(prompt))

	// Generate content
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		// Log the specific error
		log.Printf("ERROR: ReportID %s: Failed to generate content from Gemini: %v", reportID, err)
		// Provide a more specific error message if possible
		errMsg := fmt.Sprintf("AI generation failed: %v", err)
		// Check for specific error types if the SDK provides them
		updateReportStatus(reportID, "failed", errMsg, "")
		return
	}

	// Extract content more robustly
	var rawContentBuilder strings.Builder
	if resp == nil || len(resp.Candidates) == 0 || resp.Candidates[0].Content == nil || len(resp.Candidates[0].Content.Parts) == 0 {
		log.Printf("ERROR: ReportID %s: Received empty or invalid response from Gemini.", reportID)
		updateReportStatus(reportID, "failed", "AI returned empty response", "")
		return
	}

	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				if text, ok := part.(genai.Text); ok {
					rawContentBuilder.WriteString(string(text))
				}
			}
		}
	}
	rawContent := rawContentBuilder.String()

	if rawContent == "" {
		log.Printf("ERROR: ReportID %s: Extracted empty content string from Gemini response.", reportID)
		updateReportStatus(reportID, "failed", "AI returned no text content", "")
		return
	}

	log.Printf("INFO: ReportID %s: Received raw content from Gemini. Length: %d", reportID, len(rawContent))
	// Log the raw content for debugging JSON issues (again, be mindful of sensitive data)
	// log.Printf("DEBUG: ReportID %s: Raw content:\n%s", reportID, rawContent)


	// *** Clean the raw content before unmarshalling ***
	// 1. Trim whitespace
	cleanedContent := strings.TrimSpace(rawContent)
	// 2. Remove potential markdown fences
	cleanedContent = strings.TrimPrefix(cleanedContent, "```json")
	cleanedContent = strings.TrimPrefix(cleanedContent, "```")
	cleanedContent = strings.TrimSuffix(cleanedContent, "```")
	cleanedContent = strings.TrimSpace(cleanedContent) // Trim again after removing fences

	// Check if content is empty after cleaning
	if cleanedContent == "" {
		log.Printf("ERROR: ReportID %s: Content became empty after cleaning.", reportID)
		updateReportStatus(reportID, "failed", "AI response was empty after cleanup", "")
		return
	}


	// Parse the JSON response
	var reportData map[string]interface{}
	if err := json.Unmarshal([]byte(cleanedContent), &reportData); err != nil {
		// Log the specific error AND the content that failed to parse
		log.Printf("ERROR: ReportID %s: Failed to unmarshal JSON response: %v", reportID, err)
		log.Printf("DEBUG: ReportID %s: Content that failed parsing:\n%s", reportID, cleanedContent) // Log the cleaned content
		updateReportStatus(reportID, "failed", "Failed to parse AI response format", "")
		return
	}

	// Extract summary with type assertion check
	summary, ok := reportData["summary"].(string)
	if !ok {
		log.Printf("WARN: ReportID %s: 'summary' key missing or not a string in AI response.", reportID)
		// Decide how to handle: fail, or proceed with empty summary?
		// updateReportStatus(reportID, "failed", "AI response missing 'summary'", cleanedContent) // Option to fail
		// return // Option to fail
		summary = "" // Option to continue with empty summary
	}

	// It's good practice to marshal the parsed data back to string for storage,
	// ensuring it's definitely valid JSON.
	finalContentBytes, err := json.Marshal(reportData)
	if err != nil {
		log.Printf("ERROR: ReportID %s: Failed to re-marshal parsed report data: %v", reportID, err)
		updateReportStatus(reportID, "failed", "Internal error processing parsed report", "")
		return
	}
	finalContent := string(finalContentBytes)

	// Update the report with content
	log.Printf("INFO: ReportID %s: Successfully generated report content. Updating status to completed.", reportID)
	updateReportStatus(reportID, "completed", summary, finalContent) // Store the re-marshalled, validated JSON
}

// Update report status and content in the database
func updateReportStatus(reportID, status, summary, content string) {
	db.Model(&Report{}).Where("id = ?", reportID).Updates(map[string]interface{}{
		"status":  status,
		"summary": summary,
		"content": content,
	})
}

// Get a list of all reports
func getReports(c *fiber.Ctx) error {
	var reports []Report
	if err := db.Find(&reports).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch reports",
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Reports retrieved successfully",
		"data":    reports,
	})
}

// Get a specific report by ID
func getReport(c *fiber.Ctx) error {
	reportID := c.Params("id")
	
	var report Report
	if err := db.First(&report, "id = ?", reportID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Report not found",
		})
	}
	
	// Fetch patient info
	var patient Patient
	db.First(&patient, "id = ?", report.PatientID)
	
	// Calculate age
	birthDate, _ := time.Parse("2006-01-02", patient.DateOfBirth)
	age := calculateAge(birthDate)
	
	// Parse the stored JSON content
	var parsedContent map[string]interface{}
	json.Unmarshal([]byte(report.Content), &parsedContent)
	
	// Build the response
	response := ReportResponse{
		ID:          report.ID.String(),
		PatientID:   report.PatientID.String(),
		PatientName: report.PatientName,
		PatientInfo: PatientInfo{
			Age:        age,
			Gender:     patient.Gender,
			DateOfBirth: patient.DateOfBirth,
		},
		ReportType:  report.ReportType,
		Summary:     report.Summary,
		GeneratedAt: report.GeneratedAt,
		Status:      report.Status,
	}
	
	// Extract sections if available
	if sectionsRaw, ok := parsedContent["sections"].([]interface{}); ok {
		for _, sectionRaw := range sectionsRaw {
			if sectionMap, ok := sectionRaw.(map[string]interface{}); ok {
				title, _ := sectionMap["title"].(string)
				content, _ := sectionMap["content"].(string)
				response.Sections = append(response.Sections, ReportSection{
					Title:   title,
					Content: content,
				})
			}
		}
	}
	
	// Extract recommendations if available
	if recommendationsRaw, ok := parsedContent["recommendations"].([]interface{}); ok {
		for _, recRaw := range recommendationsRaw {
			if rec, ok := recRaw.(string); ok {
				response.Recommendations = append(response.Recommendations, rec)
			}
		}
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Report retrieved successfully",
		"data":    response,
	})
}

// Helper function to calculate age from birth date
func calculateAge(birthDate time.Time) int {
	now := time.Now()
	age := now.Year() - birthDate.Year()
	
	// Adjust age if birthday hasn't occurred yet this year
	birthDay := time.Date(now.Year(), birthDate.Month(), birthDate.Day(), 0, 0, 0, 0, time.UTC)
	if now.Before(birthDay) {
		age--
	}
	
	return age
}
