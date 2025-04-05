"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getAppointment, 
  getPatient, 
  updateAppointment, 
  deleteAppointment 
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  
  const [appointment, setAppointment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    time: "",
    reason: "",
    notes: "",
    status: ""
  });

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        setIsLoading(true);
        
        const appointmentData = await getAppointment(appointmentId);
        setAppointment(appointmentData.data);
        
        // Initialize form with appointment data
        setAppointmentForm({
          date: appointmentData.data.date || "",
          time: appointmentData.data.time || "",
          reason: appointmentData.data.reason || "",
          notes: appointmentData.data.notes || "",
          status: appointmentData.data.status || "scheduled"
        });
        
        // Fetch patient data if we have a patient ID
        if (appointmentData.data.patientId) {
          const patientData = await getPatient(appointmentData.data.patientId);
          setPatient(patientData.data);
        }
      } catch (error) {
        toast.error("Failed to load appointment data");
        console.error("Error loading appointment data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentData();
  }, [appointmentId]);

  const handleDeleteAppointment = async () => {
    try {
      await deleteAppointment(appointmentId);
      toast.success("Appointment cancelled successfully");
      router.push("/appointments");
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setAppointmentForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateAppointment(appointmentId, appointmentForm);
      setAppointment((prev: any) => ({ ...prev, ...appointmentForm }));
      setIsEditing(false);
      toast.success("Appointment updated successfully");
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading appointment details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Appointment Not Found</h2>
              <p className="text-muted-foreground mb-4">The appointment you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push('/appointments')}>
                Back to Appointments
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Appointment Details</h1>
            <p className="text-muted-foreground">
              View and manage appointment information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/appointments')}>
              Back to Appointments
            </Button>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Appointment
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              {isEditing ? (
                <form onSubmit={handleUpdateAppointment}>
                  <CardHeader>
                    <CardTitle>Edit Appointment</CardTitle>
                    <CardDescription>
                      Make changes to the appointment details below
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input 
                          id="date" 
                          name="date" 
                          type="date" 
                          value={appointmentForm.date} 
                          onChange={handleFormChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input 
                          id="time" 
                          name="time" 
                          type="time" 
                          value={appointmentForm.time} 
                          onChange={handleFormChange} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Input 
                        id="reason" 
                        name="reason" 
                        value={appointmentForm.reason} 
                        onChange={handleFormChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea 
                        id="notes" 
                        name="notes" 
                        value={appointmentForm.notes} 
                        onChange={handleFormChange} 
                        rows={4} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={appointmentForm.status} 
                        onValueChange={(value) => handleSelectChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="rescheduled">Rescheduled</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Appointment Information</CardTitle>
                        <CardDescription>
                          Details about the scheduled appointment
                        </CardDescription>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status || 'N/A'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                        <p className="text-lg">{formatDate(appointment.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Time</p>
                        <p className="text-lg">{appointment.time || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reason for Visit</p>
                      <p className="text-lg">{appointment.reason || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-lg whitespace-pre-wrap">{appointment.notes || 'No notes provided'}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6">
                    <Button 
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Cancel Appointment
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>
                  Details about the patient for this appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-lg">{patient.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact</p>
                      <p className="text-lg">{patient.contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="text-lg">{patient.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p className="text-lg">{formatDate(patient.dateOfBirth)}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Patient information not available</p>
                )}
              </CardContent>
              {patient && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/patients/${patient.id}`)}
                  >
                    View Patient Profile
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
        
        {/* Delete appointment confirmation dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>No, Keep Appointment</Button>
              <Button variant="destructive" onClick={handleDeleteAppointment}>Yes, Cancel Appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
} 