"use client";

import {
  Activity,
  Bell,
  Calendar,
  LogOut,
  PlusCircle,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  createAppointment,
  createHealthMetric,
  createPatient,
} from "../lib/api";

const Sidebar = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleQuickAdd = async (type: string) => {
    try {
      switch (type) {
        case "patient":
          await createPatient({
            name: "New Patient",
            dateOfBirth: new Date(),
            gender: "Not Specified",
            contact: "",
            address: "",
            bloodGroup: "",
            allergies: "",
          });
          break;
        case "appointment":
          await createAppointment({
            patientId: "",
            dateTime: new Date(),
            type: "Check-up",
            notes: "",
            status: "Scheduled",
          });
          break;
        case "metric":
          await createHealthMetric({
            patientId: "",
            type: "blood_pressure",
            value: 0,
            unit: "mmHg",
            measuredAt: new Date(),
            notes: "",
          });
          break;
      }
      setShowQuickAdd(false);
    } catch (error) {
      console.error("Error in quick add:", error);
    }
  };

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">MedThing</h1>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {[
            { icon: Activity, label: "Dashboard" },
            { icon: Users, label: "Patients" },
            { icon: Calendar, label: "Appointments" },
            { icon: Bell, label: "Alerts" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveSection(item.label)}
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 w-full transition-colors ${
                activeSection === item.label ? "bg-blue-50 text-blue-700" : ""
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg w-full transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="font-medium">Quick Add</span>
          </button>

          {showQuickAdd && (
            <div className="mt-2 ml-4 space-y-2">
              <button
                onClick={() => handleQuickAdd("patient")}
                className="text-sm text-gray-600 hover:text-blue-600 block"
              >
                Add Patient
              </button>
              <button
                onClick={() => handleQuickAdd("appointment")}
                className="text-sm text-gray-600 hover:text-blue-600 block"
              >
                Add Appointment
              </button>
              <button
                onClick={() => handleQuickAdd("metric")}
                className="text-sm text-gray-600 hover:text-blue-600 block"
              >
                Add Health Metric
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop"
            alt="Doctor profile"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Foo</p>
            <p className="text-sm text-gray-500">Bar</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="h-5 w-5" />
          </button>
        </div>
        <button className="mt-4 flex items-center gap-2 text-red-600 hover:text-red-700 w-full">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
