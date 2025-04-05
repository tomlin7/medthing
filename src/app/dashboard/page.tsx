"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getPatients, getAppointments, getStatsTrends, getMonthlyStats } from "@/lib/api-client";
import { toast } from "sonner";
import { 
  UserPlus, 
  Calendar, 
  Users, 
  Activity, 
  ClipboardList, 
  PlusCircle,
  X,
  Trash,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Line, Bar } from 'react-chartjs-2';
import { 
  ChartData, 
  getLineChartOptions, 
  getBarChartOptions, 
  prepareLineChartData, 
  prepareBarChartData 
} from '@/lib/chart-lib';

interface Note {
  id: number;
  text: string;
  date: string;
}

interface NoteProps {
  note: Note;
  onDelete: (id: number) => void;
}

// Note component
const Note = ({ note, onDelete }: NoteProps) => {
  return (
    <div className="bg-muted p-3 rounded-md mb-2 relative group">
      <p className="text-sm pr-6">{note.text}</p>
      <span className="text-xs text-muted-foreground">{note.date}</span>
      <button 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(note.id)}
      >
        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
  });
  
  // New state for trend data
  const [trends, setTrends] = useState({
    patients: "+0%",
    appointments: "+0%",
    upcoming: "+0%",
  });
  
  // Data for charts
  const [chartData, setChartData] = useState<{
    patients: ChartData;
    appointments: ChartData;
  }>({
    patients: {
      data: [],
      labels: [],
    },
    appointments: {
      data: [],
      labels: [],
    }
  });
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "Follow up with John Doe about medication", date: "Aug 4, 2023" },
    { id: 2, text: "Check lab results for Sarah Johnson", date: "Aug 5, 2023" },
    { id: 3, text: "Schedule team meeting for next week", date: "Aug 6, 2023" },
  ]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch patients and appointments data
        const [patientsResponse, appointmentsResponse, trendsResponse, monthlyStatsResponse] = await Promise.all([
          getPatients(),
          getAppointments(),
          getStatsTrends(),
          getMonthlyStats(6)
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
        
        // Set trends data if available
        if (trendsResponse.success && trendsResponse.data) {
          // Access the data nested inside the response
          const trendsData = trendsResponse.data;
          setTrends({
            patients: trendsData.patients?.trend || "+0%",
            appointments: trendsData.appointments?.trend || "+0%",
            upcoming: trendsData.upcoming?.trend || "+0%",
          });
        }
        
        // Process chart data from monthly stats API
        if (monthlyStatsResponse.success && monthlyStatsResponse.data) {
          // Access the data nested inside the response
          const monthlyData = monthlyStatsResponse.data;
          
          // Get last 6 months for chart labels
          const last6Months = getLast6Months();
          const labels = last6Months.map(month => month.label);
          
          // Extract patient data
          const patientData = last6Months.map(month => 
            monthlyData.patients && monthlyData.patients[month.key] 
              ? monthlyData.patients[month.key] 
              : 0
          );
          
          // Extract appointment data
          const appointmentData = last6Months.map(month => 
            monthlyData.appointments && monthlyData.appointments[month.key] 
              ? monthlyData.appointments[month.key] 
              : 0
          );
          
          // Set chart data
          setChartData({
            patients: {
              data: patientData,
              labels: labels
            },
            appointments: {
              data: appointmentData,
              labels: labels
            }
          });
        } else {
          // Fallback to the previous implementation if the API fails
          const processPatientChartData = () => {
            // Group patients by month of creation
            const patientsByMonth = patients.reduce((acc: Record<string, number>, patient: any) => {
              if (!patient.createdAt) return acc;
              
              const date = new Date(patient.createdAt);
              const monthYearKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              acc[monthYearKey] = (acc[monthYearKey] || 0) + 1;
              return acc;
            }, {});
            
            // Get last 6 months for chart
            const last6Months = getLast6Months();
            const patientData = last6Months.map(month => patientsByMonth[month.key] || 0);
            const patientLabels = last6Months.map(month => month.label);
            
            return {
              data: patientData,
              labels: patientLabels
            };
          };
          
          // Process appointment data for charts
          const processAppointmentChartData = () => {
            // Group appointments by month of creation
            const appointmentsByMonth = appointments.reduce((acc: Record<string, number>, appointment: any) => {
              if (!appointment.createdAt) return acc;
              
              const date = new Date(appointment.createdAt);
              const monthYearKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              acc[monthYearKey] = (acc[monthYearKey] || 0) + 1;
              return acc;
            }, {});
            
            // Get last 6 months for chart
            const last6Months = getLast6Months();
            const appointmentData = last6Months.map(month => appointmentsByMonth[month.key] || 0);
            const appointmentLabels = last6Months.map(month => month.label);
            
            return {
              data: appointmentData,
              labels: appointmentLabels
            };
          };
          
          // Set chart data
          setChartData({
            patients: processPatientChartData(),
            appointments: processAppointmentChartData()
          });
        }
        
        // Try to load notes from localStorage
        const savedNotes = localStorage.getItem("doctorNotes");
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Helper function to get the last 6 months as an array of objects with key and label
  const getLast6Months = () => {
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      });
    }
    
    return months;
  };
  
  const addNote = () => {
    if (!newNote.trim()) return;
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
    
    const newNoteObj: Note = {
      id: Date.now(),
      text: newNote.trim(),
      date: formattedDate
    };
    
    const updatedNotes = [newNoteObj, ...notes];
    setNotes(updatedNotes);
    setNewNote("");
    
    // Save to localStorage
    localStorage.setItem("doctorNotes", JSON.stringify(updatedNotes));
    toast.success("Note added successfully");
  };
  
  const deleteNote = (id: number) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    // Save to localStorage
    localStorage.setItem("doctorNotes", JSON.stringify(updatedNotes));
    toast.success("Note deleted successfully");
  };
  
  const clearAllNotes = () => {
    setNotes([]);
    localStorage.removeItem("doctorNotes");
    toast.success("All notes cleared");
  };

  interface StatCard {
    title: string;
    value: number | string;
    description: string;
    icon: React.ReactNode;
    color: string;
    trend: string;
    noTrendIcon?: boolean;
  }

  const statCards: StatCard[] = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      description: "Registered patients",
      icon: <Users className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-700",
      trend: trends.patients
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      description: "All scheduled appointments",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-green-100 text-green-700",
      trend: trends.appointments
    },
    {
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      description: "Appointments from today forward",
      icon: <ClipboardList className="h-6 w-6" />,
      color: "bg-amber-100 text-amber-700",
      trend: trends.upcoming
    },
    {
      title: "Your Activity",
      value: "Active",
      description: "Last login: Today",
      icon: <Activity className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-700",
      trend: "5 actions today",
      noTrendIcon: true
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
                <div className="flex items-center mt-2">
                  {!card.noTrendIcon && card.trend.startsWith('+') ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : !card.noTrendIcon && card.trend.startsWith('-') ? (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  ) : null}
                  <p className={`text-xs font-medium ${
                    !card.noTrendIcon && card.trend.startsWith('+') ? 'text-green-600' : 
                    !card.noTrendIcon && card.trend.startsWith('-') ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {card.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-rows-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[240px]">
              {chartData.patients.data.length > 0 ? (
                <Line 
                  data={prepareLineChartData(chartData.patients)}
                  options={getLineChartOptions("Monthly Patient Registrations")}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No patient growth data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Appointment Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[240px]">
              {chartData.appointments.data.length > 0 ? (
                <Bar 
                  data={prepareBarChartData(chartData.appointments)}
                  options={getBarChartOptions("Monthly Appointments")}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No appointment trend data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-rows-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href="/patients/new" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Patient</span>
                </a>
                <a 
                  href="/appointments/new" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Appointment</span>
                </a>
                <a 
                  href="/patients" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>View Patients</span>
                </a>
                <a 
                  href="/appointments" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>View Appointments</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Your Notes</CardTitle>
                {notes.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-destructive"
                    onClick={clearAllNotes}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden flex flex-col">
              <div className="flex gap-2 mb-4">
                <Textarea 
                  placeholder="Add a note..." 
                  className="resize-none"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addNote();
                    }
                  }}
                />
                <Button onClick={addNote} size="sm" className="self-end">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              {notes.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                  <p className="text-sm text-muted-foreground">No notes yet. Add your first note above.</p>
                </div>
              ) : (
                <ScrollArea className="flex-grow pr-4 -mr-4">
                  {notes.map(note => (
                    <Note key={note.id} note={note} onDelete={deleteNote} />
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 