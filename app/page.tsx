"use client";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import LandingPage from "../components/LandingPage";
import LoginPage from "../components/LoginPage";
import PrivateRoute from "../components/PrivateRoute";
import SignupPage from "../components/SignupPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
