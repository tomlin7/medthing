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
  Patient 
} from "@/lib/api-client";

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
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
      const response = await deletePatient(patientToDelete);
      if (response.success) {
        toast.success("Patient deleted successfully");
        fetchPatients();
      } else {
        toast.error(response.message || "Failed to delete patient");
      }
    } catch (error) {
      toast.error("Failed to delete patient");
    } finally {
      setPatientToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Button onClick={() => router.push("/patients/new")}>
          Add New Patient
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No patients found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push("/patients/new")}
              >
                Add Your First Patient
              </Button>
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
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} className="cursor-pointer hover:bg-muted" onClick={() => router.push(`/patients/${patient.id}`)}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.contact}</TableCell>
                      <TableCell>{patient.bloodGroup || "Not recorded"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/patients/${patient.id}/edit`);
                            }}
                          >
                            Edit
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPatientToDelete(patient.id);
                                }}
                              >
                                Delete
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
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={handleDelete}
                                >
                                  Delete
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