package main

import "github.com/gofiber/fiber/v2"

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
