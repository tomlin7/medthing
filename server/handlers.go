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

func getAllPatients(c *fiber.Ctx) error {
	var patients []Patient
	result := db.Find(&patients) // empty condition
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch patients"})
	}
	return c.JSON(patients)
}

func createPatient(c *fiber.Ctx) error {
	patient := new(Patient)

	// parse body as Patient
	if err := c.BodyParser(patient); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	result := db.Create(&patient)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create patient"})
	}

	return c.JSON(patient)
}

func getPatient(c *fiber.Ctx) error {
	id := c.Params("id")
	var patient Patient
	result := db.First(&patient, "id = ?", id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Patient not found"})
	}

	return c.JSON(patient)
}

func updatePatient(c *fiber.Ctx) error {
	id := c.Params("id")
	patient := new(Patient)
	if err := c.BodyParser(patient); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	result := db.Model(&Patient{}).Where("id = ?", id).Updates(patient)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update patient"})
	}

	return c.JSON(patient)
}

func deletePatient(c *fiber.Ctx) error {
	id := c.Params("id")
	result := db.Delete(&Patient{}, "id = ?", id)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete patient"})
	}
	return c.SendStatus(204) // No Content
}

func getAllAppointments(c *fiber.Ctx) error {
	var appointments []Appointment
	result := db.Find(&appointments) // empty condition
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch appointments"})
	}
	return c.JSON(appointments)
}

func createAppointment(c *fiber.Ctx) error {
	appointment := new(Appointment)
	if err := c.BodyParser(appointment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	result := db.Create(&appointment)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create appointment"})
	}

	return c.JSON(appointment)
}

func getAppointment(c *fiber.Ctx) error {
	id := c.Params("id")
	var appointment Appointment
	result := db.First(&appointment, "id = ?", id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Appointment not found"})
	}

	return c.JSON(appointment)
}

func updateAppointment(c *fiber.Ctx) error {
	id := c.Params("id")
	appointment := new(Appointment)
	if err := c.BodyParser(appointment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	result := db.Model(&Appointment{}).Where("id = ?", id).Updates(appointment)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update appointment"})
	}
	return c.SendStatus(204)
}

func deleteAppointment(c *fiber.Ctx) error {
	id := c.Params("id")
	result := db.Delete(&Appointment{}, "id = ?", id)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete appointment"})
	}
	return c.SendStatus(204) // No Content
}

func getPatientMedications(c *fiber.Ctx) error {
	id := c.Params("id")
	var medications []Medication
	result := db.Where("patient_id = ?", id).Find(&medications)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch medications"})
	}
	return c.JSON(medications)
}

func createMedication(c *fiber.Ctx) error {
	medication := new(Medication)
	if err := c.BodyParser(medication); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	result := db.Create(&medication)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create medication"})
	}

	return c.JSON(medication)
}

func updateMedication(c *fiber.Ctx) error {
	id := c.Params("id")
	medication := new(Medication)
	if err := c.BodyParser(medication); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	result := db.Model(&Medication{}).Where("id = ?", id).Updates(medication)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update medication"})
	}
	return c.SendStatus(204)
}

func deleteMedication(c *fiber.Ctx) error {
	id := c.Params("id")
	result := db.Delete(&Medication{}, "id = ?", id)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete medication"})
	}
	return c.SendStatus(204) // No Content
}

func getPatientMetrics(c *fiber.Ctx) error {
	id := c.Params("id")
	var metrics []HealthMetric
	result := db.Where("patient_id = ?", id).Find(&metrics)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch health metrics"})
	}
	return c.JSON(metrics)
}

func createHealthMetric(c *fiber.Ctx) error {
	metric := new(HealthMetric)
	if err := c.BodyParser(metric); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	result := db.Create(&metric)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create health metric"})
	}
	return c.JSON(metric)
}

func getHealthTrends(c *fiber.Ctx) error {
	patientId := c.Params("patientId")
	var metrics []HealthMetric
	result := db.Where("patient_id = ?", patientId).Find(&metrics)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch health trends"})
	}

	// group by type and calculate trends
	trends := make(map[string][]HealthMetric)
	for _, metric := range metrics {
		trends[metric.Type] = append(trends[metric.Type], metric)
	}

	return c.JSON(trends)
}

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
