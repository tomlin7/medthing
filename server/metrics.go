package main

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

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

func getStatsTrends(c *fiber.Ctx) error {
	// Get current and previous month data
	now := time.Now()
	currentMonth := now.Format("2006-01")
	lastMonth := now.AddDate(0, -1, 0).Format("2006-01")

	// Get patient count for current month
	var currentMonthPatients int64
	db.Model(&Patient{}).Where("strftime('%Y-%m', created_at) = ?", currentMonth).Count(&currentMonthPatients)

	// Get patient count for previous month
	var previousMonthPatients int64
	db.Model(&Patient{}).Where("strftime('%Y-%m', created_at) = ?", lastMonth).Count(&previousMonthPatients)

	// Get appointment count for current month
	var currentMonthAppointments int64
	db.Model(&Appointment{}).Where("strftime('%Y-%m', created_at) = ?", currentMonth).Count(&currentMonthAppointments)

	// Get appointment count for previous month
	var previousMonthAppointments int64
	db.Model(&Appointment{}).Where("strftime('%Y-%m', created_at) = ?", lastMonth).Count(&previousMonthAppointments)

	// Calculate trends
	patientTrend := calculateTrendPercentage(previousMonthPatients, currentMonthPatients)
	appointmentTrend := calculateTrendPercentage(previousMonthAppointments, currentMonthAppointments)

	// Get upcoming appointments (future dates)
	var upcomingAppointments int64
	db.Model(&Appointment{}).Where("datetime(date_time) > datetime('now')").Count(&upcomingAppointments)
	
	// Compare with last month's upcoming appointments count at the same time
	var previousUpcomingAppointments int64
	db.Model(&Appointment{}).Where("datetime(date_time) > datetime(?)", now.AddDate(0, -1, 0).Format("2006-01-02 15:04:05")).
		Where("datetime(date_time) < datetime(?)", now.AddDate(0, 0, 0).Format("2006-01-02 15:04:05")).
		Count(&previousUpcomingAppointments)

	upcomingTrend := calculateTrendPercentage(previousUpcomingAppointments, upcomingAppointments)

	// Return the calculated trends with success and message fields
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Stats trends retrieved successfully",
		"data": fiber.Map{
			"patients": fiber.Map{
				"current": currentMonthPatients,
				"previous": previousMonthPatients,
				"trend": patientTrend,
			},
			"appointments": fiber.Map{
				"current": currentMonthAppointments,
				"previous": previousMonthAppointments,
				"trend": appointmentTrend,
			},
			"upcoming": fiber.Map{
				"current": upcomingAppointments,
				"previous": previousUpcomingAppointments,
				"trend": upcomingTrend,
			},
		},
	})
}

func getMonthlyStats(c *fiber.Ctx) error {
	// Get the number of months to look back (default to 6)
	months := 6
	if c.Query("months") != "" {
		fmt.Sscanf(c.Query("months"), "%d", &months)
		if months < 1 {
			months = 6
		}
	}
	
	// Current date
	now := time.Now()
	
	// Initialize result maps
	patientCounts := make(map[string]int)
	appointmentCounts := make(map[string]int)
	
	// Get data for each month
	for i := 0; i < months; i++ {
		// Calculate target month (going backward from current month)
		targetDate := now.AddDate(0, -i, 0)
		monthKey := targetDate.Format("2006-01")
		
		// Count patients created in this month
		var patientCount int64
		db.Model(&Patient{}).Where("strftime('%Y-%m', created_at) = ?", monthKey).Count(&patientCount)
		patientCounts[monthKey] = int(patientCount)
		
		// Count appointments created in this month
		var appointmentCount int64
		db.Model(&Appointment{}).Where("strftime('%Y-%m', created_at) = ?", monthKey).Count(&appointmentCount)
		appointmentCounts[monthKey] = int(appointmentCount)
	}
	
	// Return the data with success and message fields
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Monthly stats retrieved successfully",
		"data": fiber.Map{
			"patients": patientCounts,
			"appointments": appointmentCounts,
		},
	})
}

// Helper function to calculate percentage change
func calculateTrendPercentage(previous, current int64) string {
	if previous == 0 {
		if current == 0 {
			return "0%"
		}
		return "+100%"
	}
	
	changePercent := float64(current-previous) / float64(previous) * 100
	
	if changePercent > 0 {
		return fmt.Sprintf("+%.1f%%", changePercent)
	} else if changePercent < 0 {
		return fmt.Sprintf("%.1f%%", changePercent)
	}
	
	return "0%"
}
