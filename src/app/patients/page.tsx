"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { 
  getPatients, 
  deletePatient, 
  Patient,
  generateReport
} from "@/lib/api-client";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Search, 
  UserPlus,
  Loader2,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(null);
  const router = useRouter();

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await getPatients();
      console.log("Patient response:", response);
      
      if (response.success && Array.isArray(response.data)) {
        setPatients(response.data);
      } else {
        console.error("Unexpected API response format:", response);
        toast.error("Failed to load patients: Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async () => {
    if (!patientToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await deletePatient(patientToDelete);
      if (response.success) {
        toast.success("Patient deleted successfully");
        setPatients(patients.filter(p => p.id !== patientToDelete));
      } else {
        toast.error(response.message || "Failed to delete patient");
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete patient");
    } finally {
      setPatientToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleGenerateReport = async (patientId: string) => {
    try {
      setIsGeneratingReport(patientId);
      const response = await generateReport(patientId);
      
      if (response.success) {
        toast.success("Report generated successfully");
        router.push(`/reports/${response.data.id}`);
      } else {
        toast.error("Failed to generate report");
      }
    } catch (error) {
      toast.error("Failed to generate report");
      console.error("Error generating report:", error);
    } finally {
      setIsGeneratingReport(null);
    }
  };

  const filteredPatients = searchTerm 
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.includes(searchTerm)
      )
    : patients;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Button onClick={() => router.push("/patients/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle>Patient Records</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <p className="text-muted-foreground">No patients found matching "{searchTerm}"</p>
              ) : (
                <>
                  <p className="text-muted-foreground">No patients found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push("/patients/new")}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Your First Patient
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.contact}</TableCell>
                      <TableCell>{patient.bloodGroup || "Not recorded"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            title="View patient details"
                            onClick={() => router.push(`/patients/${patient.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            title="Schedule appointment"
                            onClick={() => router.push(`/appointments/new?patientId=${patient.id}`)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            title="Generate AI Report"
                            onClick={() => handleGenerateReport(patient.id)}
                            disabled={isGeneratingReport === patient.id}
                            className="relative bg-primary/5 border-primary/20 hover:bg-primary/10 hover:text-primary text-primary/80"
                          >
                            {isGeneratingReport === patient.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <FileText className="h-4 w-4" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            title="Edit patient"
                            onClick={() => router.push(`/patients/${patient.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete patient"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Patient</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this patient? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setPatientToDelete(null)}
                                  disabled={isDeleting}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => {
                                    setPatientToDelete(patient.id);
                                    handleDelete();
                                  }}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 