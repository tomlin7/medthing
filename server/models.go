package main

import (
	"time"

	"github.com/google/uuid"
)

type Patient struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:get_random_uuid()" json:"id"`
	Name        string    `json:"name"`
	DateOfBirth time.Time `json:"dateOfBirth"`
	Gender      string    `json:"gender"`
	Contact     string    `json:"contact"`
	Address     string    `json:"address"`
	BloodGroup  string    `json:"bloodgroup"`
	Allergies   string    `json:"allergies"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Appointment struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:get_random_uuid()" json:"id"`
	PatientID uuid.UUID `json:"patientId"`
	Patient   string    `json:"patient"`
	DateTime  string    `json:"dateTime"`
	Type      string    `json:"type"`
	Notes     string    `json:"notes"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Medication struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:get_random_uuid()" json:"id"`
	PatientID uuid.UUID `json:"patientId"`
	Patient   string    `json:"patient"`
	Name      string    `json:"name"`
	Dosage    string    `json:"dosage"`
	Frequency string    `json:"frequency"`
	StartDate string    `json:"startDate"`
	EndDate   string    `json:"endDate"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
type HealthMetric struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:get_random_uuid()" json:"id"`
	PatientID  uuid.UUID `json:"patientId"`
	Patient    string    `json:"patient"`
	Type       string    `json:"type"`
	Value      string    `json:"value"`
	Unit       string    `json:"unit"`
	MeasuredAt string    `json:"measuredAt"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type AnalysisRequest struct {
	PatientID uuid.UUID `json:"patientId"`
	DataType  string    `json:"dataType"` // metrics medications appointments
}

type AnalysisResponse struct {
	Data    any    `json:"data"`
	Summary string `json:"summary"`
}
