import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const signup = (data: {
  email: string;
  password: string;
  name: string;
  specialization: string;
  licenseNumber: string;
}) => api.post("/auth/signup", data);

// patuient
export const getPatients = () => api.get("/patients");
export const getPatient = (id: string) => api.get(`/patients/${id}`);
export const createPatient = (data: any) => api.post("/patients", data);
export const updatePatient = (id: string, data: any) =>
  api.put(`/patients/${id}`, data);
export const deletePatient = (id: string) => api.delete(`/patients/${id}`);

// apmnt
export const getAppointments = () => api.get("/appointments");
export const createAppointment = (data: any) => api.post("/appointments", data);
export const updateAppointment = (id: string, data: any) =>
  api.put(`/appointments/${id}`, data);
export const deleteAppointment = (id: string) =>
  api.delete(`/appointments/${id}`);

// med
export const getPatientMedications = (patientId: string) =>
  api.get(`/medications/patient/${patientId}`);
export const createMedication = (data: any) => api.post("/medications", data);
export const updateMedication = (id: string, data: any) =>
  api.put(`/medications/${id}`, data);
export const deleteMedication = (id: string) =>
  api.delete(`/medications/${id}`);

// metrics
export const getPatientMetrics = (patientId: string) =>
  api.get(`/metrics/patient/${patientId}`);
export const createHealthMetric = (data: any) => api.post("/metrics", data);
export const getHealthTrends = (patientId: string) =>
  api.get(`/metrics/trends/${patientId}`);

// ai
export const analyzePatientData = (patientId: string, dataType: string) =>
  api.post("/ai/analyze", { patientId, dataType });
