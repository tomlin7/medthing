"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAppointments, deleteAppointment } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { toast } from "sonner";

type Appointment = {
  id: string;
  patientId: string;
  patientName?: string;
  patient?: {
    name: string;
  };
  date: string;
  time: string;
  dateTime?: string;
  reason: string;
  type?: string;
  status: string;
  notes: string;
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await getAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    
    try {
      await deleteAppointment(appointmentToDelete);
      setAppointments(appointments.filter((a) => a.id !== appointmentToDelete));
      toast.success("Appointment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete appointment");
    } finally {
      setAppointmentToDelete(null);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date) return "N/A";
    
    try {
      // Create a date string that includes both date and time
      const dateTimeString = `${date}T${time || '00:00'}`;
      const dateObj = new Date(dateTimeString);
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: time ? '2-digit' : undefined,
        minute: time ? '2-digit' : undefined
      }).format(dateObj);
    } catch (error) {
      console.error("Date formatting error:", error);
      return `${date} ${time || ''}`;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <Button asChild>
            <Link href="/appointments/new">Schedule Appointment</Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center p-8">
            <div className="h-6 w-24 mx-auto bg-muted animate-pulse rounded mb-4"></div>
            <div className="h-4 w-48 mx-auto bg-muted animate-pulse rounded"></div>
          </div>
        ) : appointments && appointments.length === 0 ? (
          <div className="text-center p-12 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">Schedule your first appointment</p>
            <Button asChild>
              <Link href="/appointments/new">Schedule Appointment</Link>
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments && appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      <Link href={`/patients/${appointment.patientId}`} className="hover:underline">
                        {appointment.patientName || (appointment.patient && appointment.patient.name) || "Unknown"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {appointment.dateTime 
                        ? formatDateTime(appointment.dateTime, '') 
                        : formatDateTime(appointment.date, appointment.time)}
                    </TableCell>
                    <TableCell>{appointment.reason || appointment.type || "N/A"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]">{appointment.notes || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/appointments/${appointment.id}`}>View</Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setAppointmentToDelete(appointment.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      
      <Dialog open={!!appointmentToDelete} onOpenChange={(open) => !open && setAppointmentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAppointmentToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 