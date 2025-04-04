export interface Doctor {
  id: string;
  email: string;
  name: string;
  specialization: string;
  licenseNumber: string;
}

export interface AuthState {
  user: Doctor | null;
  loading: boolean;
  error: string | null;
}
