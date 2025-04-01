package main

import "github.com/gofiber/fiber/v2"

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
