package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

// Initialize the database connection and perform migrations
func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to database")
	}

	// Auto migrate all models
	db.AutoMigrate(&Doctor{}, &Patient{}, &Appointment{}, &Medication{}, &HealthMetric{})
	
	// Check if we need to create a default admin doctor (for testing)
	var count int64
	db.Model(&Doctor{}).Count(&count)
	if count == 0 && os.Getenv("ENV") == "development" {
		// Create a default doctor for testing
		hashedPassword, _ := hashPassword("admin123")
		defaultDoctor := Doctor{
			ID:             uuid.New(),
			Email:          "admin@example.com",
			Password:       hashedPassword,
			Name:           "Admin Doctor",
			Specialization: "Administration",
			LicenseNumber:  "ADMIN-12345",
		}
		db.Create(&defaultDoctor)
		log.Println("Created default admin doctor: admin@example.com / admin123")
	}
}

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default environment variables")
	}
	
	// Initialize the database
	initDB()
	
	// Start the rate limiter cleanup routine in a goroutine
	go cleanupRateLimiter()

	// Create a new Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			// Default error handling
			code := fiber.StatusInternalServerError
			
			if e, ok := err.(*fiber.Error); ok {
				// Override status code if it's a Fiber error
				code = e.Code
			}
			
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New()) // Request logging
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Health check endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "MedThing API is up and running",
			"version": "1.0.0",
		})
	})

	// API routes
	api := app.Group("/api")

	// Auth routes with rate limiting
	auth := api.Group("/auth")
	auth.Use(rateLimiter()) // Apply rate limiting to auth endpoints
	auth.Post("/login", login)
	auth.Post("/signup", signup)
	auth.Get("/me", protected(), getCurrentUser)
	auth.Post("/refresh", protected(), refreshToken)

	// Patients routes - protected by JWT
	patients := api.Group("/patients")
	patients.Use(protected()) // All patient routes require authentication
	patients.Get("/", getAllPatients)
	patients.Post("/", createPatient)
	patients.Get("/:id", getPatient)
	patients.Put("/:id", updatePatient)
	patients.Delete("/:id", deletePatient)

	// Appointments routes - protected by JWT
	appointments := api.Group("/appointments")
	appointments.Use(protected()) // All appointment routes require authentication
	appointments.Get("/", getAllAppointments)
	appointments.Post("/", createAppointment)
	appointments.Get("/:id", getAppointment)
	appointments.Put("/:id", updateAppointment)
	appointments.Delete("/:id", deleteAppointment)

	// Medications routes - protected by JWT
	medications := api.Group("/medications")
	medications.Use(protected()) // All medication routes require authentication
	medications.Get("/patient/:id", getPatientMedications)
	medications.Post("/", createMedication)
	medications.Put("/:id", updateMedication)
	medications.Delete("/:id", deleteMedication)

	// Health metrics routes - protected by JWT
	metrics := api.Group("/metrics")
	metrics.Use(protected()) // All metric routes require authentication
	metrics.Get("/patient/:id", getPatientMetrics)
	metrics.Post("/", createHealthMetric)
	metrics.Get("/trends/:patientId", getHealthTrends)

	// AI analysis routes - protected by JWT
	ai := api.Group("/ai")
	ai.Use(protected()) // All AI routes require authentication
	ai.Post("/analyze", analyzePatientData)

	// Get port from environment variables or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// Start the server
	log.Printf("Starting server on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
