"use client";

import { getAppointments, getHealthTrends, getPatients } from "@/lib/api";
import { format } from "date-fns";
import { AlertTriangle, Calendar, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    criticalCases: 0,
    followUps: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [healthTrends, setHealthTrends] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const patientsRes = await getPatients();
        const patients = patientsRes.data;
        const appointmentsRes = await getAppointments();
        const appointments = appointmentsRes.data;

        const today = new Date();
        const todayAppointments = appointments.filter(
          (apt: any) =>
            format(new Date(apt.dateTime), "yyyy-MM-dd") ===
            format(today, "yyyy-MM-dd")
        );
        const criticalCases = patients.filter(
          (patient: any) => patient.status === "Critical"
        );

        setStats({
          totalPatients: patients.length,
          appointmentsToday: todayAppointments.length,
          criticalCases: criticalCases.length,
          followUps: appointments.filter(
            (apt: any) => new Date(apt.dateTime) > today
          ).length,
        });

        setRecentPatients(patients.slice(0, 3));

        setUpcomingAppointments(
          appointments
            .filter((apt: any) => new Date(apt.dateTime) > today)
            .sort(
              (a: any, b: any) =>
                new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
            )
            .slice(0, 3)
        );

        if (patients.length > 0) {
          const trendsRes = await getHealthTrends(patients[0].id);
          const trendsData = trendsRes.data;

          const labels = trendsData.dates;
          const datasets = Object.keys(trendsData).map((metric: any) => ({
            label: metric,
            data: trendsData[metric],
            borderColor: getRandomColor(),
            tension: 0.1,
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, Foo</h2>
        <p className="text-gray-600">Here's your practice overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            icon: Users,
            label: "Total Patients",
            value: stats.totalPatients,
            trend: "+12%",
            color: "blue",
          },
          {
            icon: Calendar,
            label: "Appointments Today",
            value: stats.appointmentsToday,
            trend: `${stats.appointmentsToday > 0 ? "+" : ""}${
              stats.appointmentsToday
            }`,
            color: "green",
          },
          {
            icon: AlertTriangle,
            label: "Critical Cases",
            value: stats.criticalCases,
            trend: stats.criticalCases > 0 ? "Attention needed" : "All stable",
            color: "red",
          },
          {
            icon: TrendingUp,
            label: "Follow-ups Due",
            value: stats.followUps,
            trend: `${stats.followUps} pending`,
            color: "purple",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <span className={`text-${stat.color}-600 text-sm font-medium`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Patients
          </h3>
          <div className="space-y-4">
            {recentPatients.map((patient: any) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{patient.name}</h4>
                  <p className="text-sm text-gray-500">{patient.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {format(new Date(patient.createdAt), "MMM dd, yyyy")}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      patient.status === "Critical"
                        ? "bg-red-100 text-red-700"
                        : patient.status === "Review"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Follow-ups
          </h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment: any) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {appointment.patient?.name}
                  </h4>
                  <p className="text-sm text-gray-500">{appointment.type}</p>
                </div>
                <p className="text-sm font-medium text-blue-600">
                  {format(new Date(appointment.dateTime), "MMM dd, h:mm a")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Health Trends
        </h3>
        <div className="h-64">
          <Line
            data={healthTrends}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top" as const,
                },
                title: {
                  display: true,
                  text: "Patient Health Metrics Over Time",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
