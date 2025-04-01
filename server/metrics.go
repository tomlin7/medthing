package main

import "github.com/gofiber/fiber/v2"

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
