package main

import "github.com/google/uuid"

type AnalysisRequest struct {
	PatientID uuid.UUID `json:"patientId"`
	DataType  string    `json:"dataType"` // metrics medications appointments
}

type AnalysisResponse struct {
	Data    any    `json:"data"`
	Summary string `json:"summary"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignupRequest struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	Name           string `json:"name"`
	Specialization string `json:"specialization"`
	LicenseNumber  string `json:"licenseNumber"`
}

type AuthResponse struct {
	Token  string `json:"token"`
	Doctor Doctor `json:"doctor"`
}
