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
