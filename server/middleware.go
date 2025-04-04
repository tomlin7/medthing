package main

import (
	"strings"
	"time"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// JWT secret key from environment variable, fallback to a default for dev
var jwtSecret = []byte("your-secret-key")

// Rate limiter implementation
type rateLimiterConfig struct {
	// Max requests allowed in the time window
	max int
	// Time window in seconds
	windowSize time.Duration
	// IP address map with request count and expiry time
	clients map[string]*clientRateLimit
	mu      sync.Mutex
}

type clientRateLimit struct {
	count    int
	lastSeen time.Time
}

var limiter = &rateLimiterConfig{
	max:        20,          // 20 requests
	windowSize: time.Minute, // per minute
	clients:    make(map[string]*clientRateLimit),
}

// Rate limiting middleware
func rateLimiter() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.IP()
		limiter.mu.Lock()
		defer limiter.mu.Unlock()

		// Initialize or get existing client data
		client, exists := limiter.clients[ip]
		if !exists || time.Since(client.lastSeen) > limiter.windowSize {
			// If client doesn't exist or window has expired, reset count
			limiter.clients[ip] = &clientRateLimit{
				count:    1,
				lastSeen: time.Now(),
			}
			return c.Next()
		}

		// Check if client has exceeded limit
		if client.count >= limiter.max {
			return c.Status(429).JSON(fiber.Map{
				"success": false,
				"message": "Too many requests, please try again later",
			})
		}

		// Increment count and update last seen
		client.count++
		client.lastSeen = time.Now()
		return c.Next()
	}
}

// Cleanup routine for rate limiter
func cleanupRateLimiter() {
	for {
		time.Sleep(time.Minute)
		
		limiter.mu.Lock()
		for ip, client := range limiter.clients {
			if time.Since(client.lastSeen) > limiter.windowSize {
				delete(limiter.clients, ip)
			}
		}
		limiter.mu.Unlock()
	}
}

// JWT token verification middleware
func protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"message": "Authentication required",
			})
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid token")
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"message": "Invalid or expired token",
			})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"message": "Invalid token claims",
			})
		}

		// Validate expiration
		if exp, ok := claims["exp"].(float64); !ok || float64(time.Now().Unix()) > exp {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"message": "Token has expired",
			})
		}

		doctorID, err := uuid.Parse(claims["id"].(string))
		if err != nil {
			return c.Status(401).JSON(fiber.Map{
				"success": false, 
				"message": "Invalid doctor ID in token",
			})
		}

		// Set doctor ID to context locals for route handlers to use
		c.Locals("doctorId", doctorID)
		return c.Next()
	}
}
