package main

import "github.com/gofiber/fiber/v2"

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
