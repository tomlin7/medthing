"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_URL } from "./api-client";

type Doctor = {
  id: string;
  email: string;
  name: string;
  specialization: string;
  licenseNumber: string;
};

type AuthContextType = {
  user: Doctor | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (doctor: {
    email: string;
    password: string;
    name: string;
    specialization: string;
    licenseNumber: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // If we have a token and user, redirect to dashboard if on login page
          if (window.location.pathname === '/') {
            router.push('/dashboard');
          }
        } catch (err) {
          console.error("Failed to parse stored user data", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
  }, [router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting login with:", { email });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log("Login response:", data);
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }
      
      // Check if we received a valid response structure
      if (!data.token && (!data.data || !data.data.token)) {
        console.error("Unexpected API response format:", data);
        throw new Error("Unexpected response from server");
      }
      
      // Handle different response formats
      const authToken = data.token || data.data?.token;
      const userData = data.user || data.data?.user || null;
      
      if (!authToken) {
        throw new Error("No token received from server");
      }
      
      // Successfully logged in
      toast.success("Login successful");
      
      // Set the token and user in state
      setToken(authToken);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.warn("No user data received from server");
      }
      
      // Store token in localStorage
      localStorage.setItem("token", authToken);
      
      // Set a cookie for the middleware (optional, but helps with SSR)
      document.cookie = `token=${authToken}; path=/; max-age=259200`; // 3 days
      
      // Navigate to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      toast.error(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (doctor: {
    email: string;
    password: string;
    name: string;
    specialization: string;
    licenseNumber: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting signup with:", { email: doctor.email });
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctor),
      });
      
      const data = await response.json();
      console.log("Signup response:", data);
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to signup");
      }
      
      // Check if we received a valid response structure
      if (!data.token && (!data.data || !data.data.token)) {
        console.error("Unexpected API response format:", data);
        throw new Error("Unexpected response from server");
      }
      
      // Handle different response formats
      const authToken = data.token || data.data?.token;
      const userData = data.user || data.data?.user || null;
      
      if (!authToken) {
        throw new Error("No token received from server");
      }
      
      // Successfully signed up
      toast.success("Account created successfully");
      
      // Set the token and user in state
      setToken(authToken);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.warn("No user data received from server");
      }
      
      // Store token in localStorage
      localStorage.setItem("token", authToken);
      
      // Set a cookie for the middleware (optional, but helps with SSR)
      document.cookie = `token=${authToken}; path=/; max-age=259200`; // 3 days
      
      // Navigate to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during signup");
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Redirect to login page
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 