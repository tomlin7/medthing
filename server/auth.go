package main

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// Initialize JWT secret from environment variable if available
func init() {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		jwtSecret = []byte(secret)
	}
}

// Password hashing with bcrypt
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// Password verification
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Generate JWT token with custom claims
func generateToken(doctor Doctor) (string, error) {
	// Create a new token object
	token := jwt.New(jwt.SigningMethodHS256)

	// Set claims
	claims := token.Claims.(jwt.MapClaims)
	claims["id"] = doctor.ID
	claims["email"] = doctor.Email
	claims["name"] = doctor.Name
	claims["specialization"] = doctor.Specialization
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix() // 3 days expiration

	// Generate signed token
	t, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return t, nil
}

// Login handler
func login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request format",
		})
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Email and password are required",
		})
	}

	// Find doctor by email
	var doctor Doctor
	result := db.Where("email = ?", req.Email).First(&doctor)
	if result.Error != nil {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"message": "Invalid email or password",
		})
	}

	// Verify password
	if !checkPasswordHash(req.Password, doctor.Password) {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"message": "Invalid email or password",
		})
	}

	// Generate JWT token
	token, err := generateToken(doctor)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Authentication failed, please try again",
		})
	}

	// Don't return password in response
	doctor.Password = ""
	
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login successful",
		"data": fiber.Map{
			"token": token,
			"user": doctor,
		},
	})
}

// Signup handler
func signup(c *fiber.Ctx) error {
	var req SignupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request format",
		})
	}

	// Validate input
	if req.Email == "" || req.Password == "" || req.Name == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Email, password, and name are required",
		})
	}

	// Check if email already exists
	var existingDoctor Doctor
	if result := db.Where("email = ?", req.Email).First(&existingDoctor); result.Error == nil {
		return c.Status(409).JSON(fiber.Map{
			"success": false,
			"message": "Email already registered",
		})
	}

	// Hash password
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to process registration",
		})
	}

	// Create new doctor
	doctor := Doctor{
		ID:             uuid.New(),
		Email:          req.Email,
		Password:       hashedPassword,
		Name:           req.Name,
		Specialization: req.Specialization,
		LicenseNumber:  req.LicenseNumber,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Save to database
	result := db.Create(&doctor)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create account",
		})
	}

	// Generate JWT token
	token, err := generateToken(doctor)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Account created but authentication failed",
		})
	}

	// Don't return password in response
	doctor.Password = ""
	
	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Account created successfully",
		"data": fiber.Map{
			"token": token,
			"user": doctor,
		},
	})
}

// Get current user info from token
func getCurrentUser(c *fiber.Ctx) error {
	// Get doctor ID from middleware
	doctorId, ok := c.Locals("doctorId").(uuid.UUID)
	if !ok {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve user information",
		})
	}

	// Find doctor in database
	var doctor Doctor
	result := db.First(&doctor, "id = ?", doctorId)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "User not found",
		})
	}

	// Don't return password
	doctor.Password = ""

	return c.JSON(fiber.Map{
		"success": true,
		"data": doctor,
	})
}

// Refresh token endpoint
func refreshToken(c *fiber.Ctx) error {
	// Get doctor ID from middleware
	doctorId, ok := c.Locals("doctorId").(uuid.UUID)
	if !ok {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"message": "Authentication required",
		})
	}

	// Find doctor in database
	var doctor Doctor
	result := db.First(&doctor, "id = ?", doctorId)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "User not found",
		})
	}

	// Generate new token
	token, err := generateToken(doctor)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to refresh token",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Token refreshed",
		"data": fiber.Map{
			"token": token,
		},
	})
}
