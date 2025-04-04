"use client";

import { AuthState } from "@/lib/structs";
import { useEffect, useState } from "react";
import { login as apiLogin, signup as apiSignup } from "../lib/api";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setState({
        user: JSON.parse(userData),
        loading: false,
        error: null,
      });
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const { data } = await apiLogin({ email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.doctor));

      setState({
        user: data.doctor,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || "An error occurred",
      }));
      throw error;
    }
  };

  const signup = async (formData: {
    email: string;
    password: string;
    name: string;
    specialization: string;
    licenseNumber: string;
  }) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const { data } = await apiSignup(formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.doctor));

      setState({
        user: data.doctor,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || "An error occurred",
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({
      user: null,
      loading: false,
      error: null,
    });
  };

  return {
    ...state,
    login,
    signup,
    logout,
  };
}
