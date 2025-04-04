# MedThing API - Medical Reports Backend

This is the backend API for the MedThing medical reports application. It provides endpoints for doctors to manage patients, appointments, medications, and health metrics.

## Features

- JWT-based authentication system
- Rate limiting protection for auth endpoints
- CRUD operations for patients, appointments, medications, and health metrics
- AI analysis for patient data
- SQLite database for data persistence

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new doctor
- `POST /api/auth/login` - Login as a doctor
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Patients

- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create a new patient
- `GET /api/patients/:id` - Get a specific patient
- `PUT /api/patients/:id` - Update a patient
- `DELETE /api/patients/:id` - Delete a patient

### Appointments

- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create a new appointment
- `GET /api/appointments/:id` - Get a specific appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment

### Medications

- `GET /api/medications/patient/:id` - Get all medications for a patient
- `POST /api/medications` - Create a new medication
- `PUT /api/medications/:id` - Update a medication
- `DELETE /api/medications/:id` - Delete a medication

### Health Metrics

- `GET /api/metrics/patient/:id` - Get all health metrics for a patient
- `POST /api/metrics` - Create a new health metric
- `GET /api/metrics/trends/:patientId` - Get health trends for a patient

### AI Analysis

- `POST /api/ai/analyze` - Analyze patient data

## Authentication

All endpoints (except authentication) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": { ... } // Optional response data
}
```

## Error Handling

The API returns appropriate HTTP status codes along with error messages:

- `400 Bad Request` - Invalid input or parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Valid authentication but insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., email already registered)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server-side error

## Getting Started

### Prerequisites

- Go 1.16 or higher
- SQLite

### Installation

1. Clone the repository
2. Create a `.env` file with the following variables:
   ```
   PORT=8000
   JWT_SECRET=your-secret-key
   ENV=development
   ```
3. Run the server:
   ```
   go run *.go
   ```

## Default Test Account

When running in development mode, a default doctor account is created:

- Email: admin@example.com
- Password: admin123

## Security Features

- Password hashing with bcrypt
- JWT token authentication with expiration
- Rate limiting for auth endpoints
- CORS protection 