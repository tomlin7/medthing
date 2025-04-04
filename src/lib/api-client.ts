"use client";

import { z } from "zod";
import { toast } from "sonner";

// Define interfaces for our response types
interface StandardResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Define the API response schema with flexible data type
const ApiResponse = z.union([
  // Standard object response with success/message/data
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
  }),
  // Handle direct array responses (for backward compatibility)
  z.array(z.any()),
]);

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

const API_URL = "http://localhost:8000/api";

export const fetchApi = async (
  endpoint: string,
  options: FetchOptions = {}
) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    console.log(`Fetching ${API_URL}${endpoint}`, config);
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const rawData = await response.json();

    // Validate and parse the response using Zod
    let parsedResponse: StandardResponse | any[];
    try {
      parsedResponse = ApiResponse.parse(rawData);
      console.log(`API response from ${endpoint}:`, parsedResponse);
    } catch (parseError) {
      console.error(`API response validation error for ${endpoint}:`, parseError);
      console.error(`Raw response:`, rawData);
      
      // Adapt the response to our expected format
      if (Array.isArray(rawData)) {
        // If it's an array, wrap it in our response format
        parsedResponse = {
          success: response.ok,
          message: response.ok ? "Success" : "Error",
          data: rawData
        };
      } else if (typeof rawData === 'object' && rawData !== null) {
        // If it's an object, try to adapt it to our format
        parsedResponse = {
          success: response.ok,
          message: rawData.message || (response.ok ? "Success" : "Error"),
          data: rawData.data || rawData
        };
      } else {
        // Default fallback
        parsedResponse = {
          success: response.ok,
          message: response.ok ? "Success" : "Error",
          data: rawData
        };
      }
    }

    if (!response.ok) {
      // Check for authentication error
      if (response.status === 401) {
        // If token is expired or invalid, clear it and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
        // Since we know we're in an error case, we have a standardized error message
        const errorMessage = 
          typeof parsedResponse === 'object' && !Array.isArray(parsedResponse) && parsedResponse.message 
            ? parsedResponse.message 
            : "Authentication failed. Please login again.";
            
        throw new Error(errorMessage);
      }
      
      // Show a toast for other errors
      // Construct error message safely
      const errorMessage = 
        typeof parsedResponse === 'object' && !Array.isArray(parsedResponse) && parsedResponse.message
          ? parsedResponse.message
          : "API request failed";
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Return standardized response format
    if (Array.isArray(parsedResponse)) {
      return {
        success: true,
        message: "Success",
        data: parsedResponse
      } as StandardResponse;
    }
    
    return parsedResponse as StandardResponse;
  } catch (error: any) {
    // Log the error for debugging
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// === Type definitions === 
export const PatientSchema = z.object({
  id: z.string(),
  name: z.string(),
  dateOfBirth: z.string(),
  gender: z.string(),
  contact: z.string(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;

export const AppointmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string().optional(),
  date: z.string(),
  time: z.string(),
  reason: z.string(),
  notes: z.string().optional(),
  status: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

// Patients API
export const getPatients = async (): Promise<StandardResponse> => {
  const response = await fetchApi("/patients");
  // Ensure data is always an array
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : []
  };
};

export const getPatient = async (id: string): Promise<StandardResponse> => {
  const response = await fetchApi(`/patients/${id}`);
  return response;
};

export const createPatient = (patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<StandardResponse> => 
  fetchApi("/patients", { method: "POST", body: patient });

export const updatePatient = (id: string, patient: Partial<Patient>): Promise<StandardResponse> => 
  fetchApi(`/patients/${id}`, { method: "PUT", body: patient });

export const deletePatient = (id: string): Promise<StandardResponse> => 
  fetchApi(`/patients/${id}`, { method: "DELETE" });

// Appointments API
export const getAppointments = async (): Promise<StandardResponse> => {
  const response = await fetchApi("/appointments");
  // Ensure data is always an array
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : []
  };
};

export const getAppointment = (id: string): Promise<StandardResponse> => 
  fetchApi(`/appointments/${id}`);

export const createAppointment = (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<StandardResponse> => 
  fetchApi("/appointments", { method: "POST", body: appointment });

export const updateAppointment = (id: string, appointment: Partial<Appointment>): Promise<StandardResponse> => 
  fetchApi(`/appointments/${id}`, { method: "PUT", body: appointment });

export const deleteAppointment = (id: string): Promise<StandardResponse> => 
  fetchApi(`/appointments/${id}`, { method: "DELETE" });

// Medications API
export const getPatientMedications = async (patientId: string): Promise<StandardResponse> => {
  const response = await fetchApi(`/medications/patient/${patientId}`);
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : []
  };
};

export const createMedication = (medication: any): Promise<StandardResponse> => 
  fetchApi("/medications", { method: "POST", body: medication });

export const updateMedication = (id: string, medication: any): Promise<StandardResponse> => 
  fetchApi(`/medications/${id}`, { method: "PUT", body: medication });

export const deleteMedication = (id: string): Promise<StandardResponse> => 
  fetchApi(`/medications/${id}`, { method: "DELETE" });

// Health Metrics API
export const getPatientMetrics = async (patientId: string): Promise<StandardResponse> => {
  const response = await fetchApi(`/metrics/patient/${patientId}`);
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : []
  };
};

export const createHealthMetric = (metric: any): Promise<StandardResponse> => 
  fetchApi("/metrics", { method: "POST", body: metric });

export const getHealthTrends = (patientId: string): Promise<StandardResponse> => 
  fetchApi(`/metrics/trends/${patientId}`);

// AI Analysis API
export const analyzePatientData = (data: { patientId: string; dataType: string }): Promise<StandardResponse> => 
  fetchApi("/ai/analyze", { method: "POST", body: data }); 