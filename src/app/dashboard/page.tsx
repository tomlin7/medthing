"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatients, getAppointments } from "@/lib/api-client";
import { toast } from "sonner";
import { CalendarIcon, UsersIcon, ClipboardIcon, ActivityIcon } from "lucide-react";

interface StatsCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch patients and appointments data
        const [patientsResponse, appointmentsResponse] = await Promise.all([
          getPatients(),
          getAppointments()
        ]);
        
        // Get data counts
        const patients = Array.isArray(patientsResponse.data) ? patientsResponse.data : [];
        const appointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
        
        // Calculate upcoming appointments (those scheduled for today or later)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = appointments.filter(appt => {
          const apptDate = new Date(appt.date);
          return apptDate >= today;
        });

        setStats({
          totalPatients: patients.length,
          totalAppointments: appointments.length,
          upcomingAppointments: upcoming.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards: StatsCard[] = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      description: "Registered patients",
      icon: <UsersIcon className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      description: "All scheduled appointments",
      icon: <CalendarIcon className="h-6 w-6" />,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      description: "Appointments from today forward",
      icon: <ClipboardIcon className="h-6 w-6" />,
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: "Your Activity",
      value: "Active",
      description: "Last login: Today",
      icon: <ActivityIcon className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-700",
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Dr. {user.name?.split(' ')[1] || user.name}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.color}`}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <a href="/patients/new" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-3 rounded-lg text-center transition-colors">
                Add Patient
              </a>
              <a href="/appointments/new" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-3 rounded-lg text-center transition-colors">
                Schedule Appointment
              </a>
              <a href="/patients" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-3 rounded-lg text-center transition-colors">
                View Patients
              </a>
              <a href="/appointments" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-3 rounded-lg text-center transition-colors">
                View Appointments
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
              <p className="text-sm text-muted-foreground">Notes feature coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 