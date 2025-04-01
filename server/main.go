package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to database")
	}

	db.AutoMigrate(&Patient{}, &Appointment{}, &Medication{}, &HealthMetric{})
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	initDB()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))
	// app.Use(cors.Default())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, world!")
	})

	api := app.Group("/api")

	patients := api.Group("/patients")

	patients.Get("/", getAllPatients)
	patients.Post("/", createPatient)
	patients.Get("/:id", getPatient)
	patients.Put("/:id", updatePatient)
	patients.Delete("/:id", deletePatient)

	appointments := api.Group("/appointments")

	appointments.Get("/", getAllAppointments)
	appointments.Post("/", createAppointment)
	appointments.Get("/:id", getAppointment)
	appointments.Put("/:id", updateAppointment)
	appointments.Delete("/:id", deleteAppointment)

	medications := api.Group("/medications")
	medications.Get("/patient/:id", getPatientMedications)
	medications.Post("/", createMedication)
	medications.Put("/:id", updateMedication)
	medications.Delete("/:id", deleteMedication)

	metrics := api.Group("/metrics")
	metrics.Get("/patient/:id", getPatientMetrics)
	metrics.Post("/", createHealthMetric)
	metrics.Get("/trends/:patientId", getHealthTrends)

	ai := api.Group("/ai")
	ai.Post("/analyze", analyzePatientData)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Fatal(app.Listen(":" + port))

}
