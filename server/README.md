# MedThing API - Medical Reports Backend

This is the backend API for the MedThing medical reports application. It provides comprehensive endpoints for healthcare professionals to manage patients, appointments, medications, health metrics, and AI-powered medical reports.

## Features

- JWT-based secure authentication system 
- Rate limiting and IP-based protection for auth endpoints
- CRUD operations for patients, appointments, medications, and health metrics
- AI-powered analysis and report generation for patient data
- PDF report generation with customizable templates
- Real-time data visualization for patient health trends
- REST API with consistent error handling and response formats
- SQLite database for data persistence with transaction support
- Thorough input validation and sanitization

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new healthcare professional
- `POST /api/auth/login` - Login as a healthcare professional
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Invalidate current session

### Patients

- `GET /api/patients` - Get all patients (with pagination)
- `POST /api/patients` - Create a new patient
- `GET /api/patients/:id` - Get a specific patient with complete records
- `PUT /api/patients/:id` - Update a patient
- `DELETE /api/patients/:id` - Delete a patient
- `GET /api/patients/search` - Search patients by name, ID, or condition

### Reports and AI Analysis

- `POST /api/reports/generate` - Generate a comprehensive patient report
- `GET /api/reports/:id` - Get a specific report
- `GET /api/reports` - Get all reports

### Appointments

- `GET /api/appointments` - Get all appointments (with filtering)
- `POST /api/appointments` - Create a new appointment
- `GET /api/appointments/:id` - Get a specific appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment
- `GET /api/appointments/calendar` - Get appointments in calendar format

### Medications

- `GET /api/medications/patient/:id` - Get all medications for a patient
- `POST /api/medications` - Create a new medication
- `PUT /api/medications/:id` - Update a medication
- `DELETE /api/medications/:id` - Delete a medication
- `GET /api/medications/interactions` - Check for medication interactions

### Health Metrics

- `GET /api/metrics/patient/:id` - Get all health metrics for a patient
- `POST /api/metrics` - Create a new health metric
- `GET /api/metrics/trends/:patientId` - Get health trends for a patient
- `GET /api/metrics/vitals/:patientId` - Get latest vital signs
- `POST /api/metrics/batch` - Record multiple metrics at once

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
  "data": { ... }, // Optional response data
  "meta": { ... }  // Optional metadata (pagination, etc.)
}
```

## Error Handling

The API returns appropriate HTTP status codes along with detailed error messages:

- `400 Bad Request` - Invalid input or parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Valid authentication but insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., email already registered)
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server-side error

## Getting Started

### Prerequisites

- Go 1.18 or higher
- SQLite 3.x
- Node.js 16+ (for frontend development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/medthing.git
   cd medthing
   ```

2. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=8000
   JWT_SECRET=your-secure-secret-key
   AI_API_KEY=your-ai-api-key
   ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

   <!-- DB_PATH=./data/medthing.db
   RATE_LIMIT=100
   CORS_ORIGIN=http://localhost:3000
   AI_API_KEY=your-ai-api-key -->

3. Install dependencies:
   ```
   go mod download
   ```

5. Run the server:
   ```
   go run main.go
   ```

6. The API will be available at `http://localhost:8000`

## Frontend Development

The frontend for this API is built with Next.js and can be found in the root directory. To run it:

1. Install dependencies:
   ```
   bun install
   ```

2. Start the development server:
   ```
   bun run dev
   ```

3. The application will be available at `http://localhost:3000`

## Default Test Account

When running in development mode, a default healthcare professional account is created:

- Email: admin@example.com
- Password: admin123

## Security Features

- Password hashing with bcrypt with appropriate cost factor
- JWT token authentication
- Rate limiting for all API endpoints
- CORS configuration for API security
- Content Security Policy headers

## Acknowledgments

- AI-powered features utilize the Gemini API