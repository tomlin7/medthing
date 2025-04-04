package main

import (
	"time"

	"github.com/google/uuid"
)

type Doctor struct {
	ID             uuid.UUID `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Email          string    `gorm:"unique;not null" json:"email"`
	Password       string    `gorm:"not null" json:"-"`
	Name           string    `json:"name"`
	Specialization string    `json:"specialization"`
	LicenseNumber  string    `json:"licenseNumber"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type Patient struct {
	ID          uuid.UUID `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name        string    `json:"name"`
	DateOfBirth string `json:"dateOfBirth"`
	Gender      string    `json:"gender"`
	Contact     string    `json:"contact"`
	Address     string    `json:"address"`
	BloodGroup  string    `json:"bloodGroup"`
	Allergies   string    `json:"allergies"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Appointment struct {
	ID        uuid.UUID `gorm:"primaryKey;type:varchar(36)" json:"id"`
	PatientID uuid.UUID `json:"patientId"`
	Patient   Patient   `json:"patient"`
	DateTime  string `json:"dateTime"`
	Type      string    `json:"type"`
	Notes     string    `json:"notes"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Medication struct {
	ID        uuid.UUID `gorm:"primaryKey;type:varchar(36)" json:"id"`
	PatientID uuid.UUID `json:"patientId"`
	Patient   Patient   `json:"patient"`
	Name      string    `json:"name"`
	Dosage    string    `json:"dosage"`
	Frequency string    `json:"frequency"`
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type HealthMetric struct {
	ID         uuid.UUID `gorm:"primaryKey;type:varchar(36)" json:"id"`
	PatientID  uuid.UUID `json:"patientId"`
	Patient    Patient   `json:"patient"`
	Type       string    `json:"type"` // e.g., "blood_pressure", "blood_sugar", "weight"
	Value      float64   `json:"value"`
	Unit       string    `json:"unit"`
	MeasuredAt string `json:"measuredAt"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}
