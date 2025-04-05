"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getPatient, 
  getPatientMedications, 
  getPatientMetrics, 
  createMedication, 
  createHealthMetric, 
  deletePatient, 
  deleteMedication,
  generateReport
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Loader2,
  Sparkles
} from "lucide-react";

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // New medication form
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    notes: ""
  });
  
  // New health metric form
  const [showMetricDialog, setShowMetricDialog] = useState(false);
  const [metricForm, setMetricForm] = useState({
    type: "",
    value: "",
    unit: "",
    measuredAt: "",
    notes: ""
  });
  
  // Item to delete
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        
        const [patientData, medicationsData, metricsData] = await Promise.all([
          getPatient(patientId),
          getPatientMedications(patientId),
          getPatientMetrics(patientId)
        ]);
        
        setPatient(patientData.data);
        setMedications(medicationsData.data);
        setMetrics(metricsData.data);
      } catch (error) {
        toast.error("Failed to load patient data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleDeletePatient = async () => {
    try {
      await deletePatient(patientId);
      toast.success("Patient deleted successfully");
      router.push("/patients");
    } catch (error) {
      toast.error("Failed to delete patient");
    }
  };
  
  const handleDeleteMedication = async () => {
    if (!medicationToDelete) return;
    
    try {
      await deleteMedication(medicationToDelete);
      setMedications(medications.filter(med => med.id !== medicationToDelete));
      toast.success("Medication deleted successfully");
    } catch (error) {
      toast.error("Failed to delete medication");
    } finally {
      setMedicationToDelete(null);
    }
  };
  
  const handleMedicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMedicationForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newMedication = {
        ...medicationForm,
        patientId
      };
      
      const response = await createMedication(newMedication);
      setMedications([...medications, response.data]);
      setMedicationForm({
        name: "",
        dosage: "",
        frequency: "",
        startDate: "",
        endDate: "",
        notes: ""
      });
      setShowMedicationDialog(false);
      toast.success("Medication added successfully");
    } catch (error) {
      toast.error("Failed to add medication");
    }
  };
  
  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetricForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newMetric = {
        ...metricForm,
        patientId,
        value: parseFloat(metricForm.value)
      };
      
      const response = await createHealthMetric(newMetric);
      setMetrics([...metrics, response.data]);
      setMetricForm({
        type: "",
        value: "",
        unit: "",
        measuredAt: "",
        notes: ""
      });
      setShowMetricDialog(false);
      toast.success("Health metric added successfully");
    } catch (error) {
      toast.error("Failed to add health metric");
    }
  };
  
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
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
      setIsGeneratingReport(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto p-4 py-8">
          <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh]">
            <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
            <div className="h-6 w-64 bg-muted animate-pulse rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto p-4 py-8">
          <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold">Patient Not Found</h1>
            <p className="text-muted-foreground">The patient you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/patients")}>Back to Patients</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground">
              {calculateAge(patient.dateOfBirth)} years • {patient.gender} • {patient.bloodGroup || "Blood Group: N/A"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/patients/${patientId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Patient
            </Button>
            <Button 
              variant="outline"
              className="bg-primary/5 border-primary/10 hover:bg-primary/10 text-primary hover:text-primary" 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Report
                </>
              )}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Patient
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p>{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p>{formatDate(patient.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p>{patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                      <p>{patient.bloodGroup || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact</p>
                      <p>{patient.contact || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Registered On</p>
                      <p>{formatDate(patient.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{patient.address || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Allergies & Medical History</p>
                    <p className="whitespace-pre-line">{patient.allergies || "None recorded"}</p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {medications.length === 0 ? (
                      <p className="text-muted-foreground">No medications recorded</p>
                    ) : (
                      <ul className="space-y-2">
                        {medications.slice(0, 3).map(med => (
                          <li key={med.id} className="p-2 border rounded">
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency}
                            </p>
                          </li>
                        ))}
                        {medications.length > 3 && (
                          <p className="text-sm text-center mt-2">
                            +{medications.length - 3} more medications
                          </p>
                        )}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowMedicationDialog(true)}
                    >
                      Add Medication
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Health Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics.length === 0 ? (
                      <p className="text-muted-foreground">No health metrics recorded</p>
                    ) : (
                      <ul className="space-y-2">
                        {metrics.slice(0, 3).map(metric => (
                          <li key={metric.id} className="p-2 border rounded">
                            <p className="font-medium">{metric.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {metric.value} {metric.unit} • {formatDate(metric.measuredAt)}
                            </p>
                          </li>
                        ))}
                        {metrics.length > 3 && (
                          <p className="text-sm text-center mt-2">
                            +{metrics.length - 3} more metrics
                          </p>
                        )}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowMetricDialog(true)}
                    >
                      Add Health Metric
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="medications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Medications</CardTitle>
                  <CardDescription>Manage patient's medications</CardDescription>
                </div>
                <Button onClick={() => setShowMedicationDialog(true)}>Add Medication</Button>
              </CardHeader>
              <CardContent>
                {medications.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground mb-4">No medications have been added yet</p>
                    <Button onClick={() => setShowMedicationDialog(true)}>Add First Medication</Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {medications.map(med => (
                      <div key={med.id} className="py-4 flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{med.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} • {med.frequency}
                          </p>
                          <p className="text-sm mt-1">
                            {formatDate(med.startDate)} to {formatDate(med.endDate)}
                          </p>
                          {med.notes && <p className="text-sm mt-2">{med.notes}</p>}
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setMedicationToDelete(med.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metrics">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Health Metrics</CardTitle>
                  <CardDescription>Track patient's health measurements</CardDescription>
                </div>
                <Button onClick={() => setShowMetricDialog(true)}>Add Metric</Button>
              </CardHeader>
              <CardContent>
                {metrics.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground mb-4">No health metrics have been added yet</p>
                    <Button onClick={() => setShowMetricDialog(true)}>Add First Health Metric</Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {metrics.map(metric => (
                      <div key={metric.id} className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{metric.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              {metric.value} {metric.unit} • Measured on {formatDate(metric.measuredAt)}
                            </p>
                            {metric.notes && <p className="text-sm mt-2">{metric.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Delete Patient Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this patient? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePatient}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Medication Dialog */}
      <Dialog open={!!medicationToDelete} onOpenChange={(open) => !open && setMedicationToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medication</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this medication? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicationToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMedication}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Medication Dialog */}
      <Dialog open={showMedicationDialog} onOpenChange={setShowMedicationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter the details of the medication
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMedication}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="med-name">Medication Name</Label>
                  <Input
                    id="med-name"
                    name="name"
                    value={medicationForm.name}
                    onChange={handleMedicationChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-dosage">Dosage</Label>
                  <Input
                    id="med-dosage"
                    name="dosage"
                    placeholder="e.g. 10mg"
                    value={medicationForm.dosage}
                    onChange={handleMedicationChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="med-frequency">Frequency</Label>
                <Input
                  id="med-frequency"
                  name="frequency"
                  placeholder="e.g. Twice daily"
                  value={medicationForm.frequency}
                  onChange={handleMedicationChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="med-startDate">Start Date</Label>
                  <Input
                    id="med-startDate"
                    name="startDate"
                    type="date"
                    value={medicationForm.startDate}
                    onChange={handleMedicationChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-endDate">End Date</Label>
                  <Input
                    id="med-endDate"
                    name="endDate"
                    type="date"
                    value={medicationForm.endDate}
                    onChange={handleMedicationChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="med-notes">Notes</Label>
                <Textarea
                  id="med-notes"
                  name="notes"
                  placeholder="Additional information..."
                  value={medicationForm.notes}
                  onChange={handleMedicationChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Medication</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Health Metric Dialog */}
      <Dialog open={showMetricDialog} onOpenChange={setShowMetricDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Health Metric</DialogTitle>
            <DialogDescription>
              Record a new health measurement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMetric}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="metric-type">Metric Type</Label>
                <select
                  id="metric-type"
                  name="type"
                  value={metricForm.type}
                  onChange={handleMetricChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Select type</option>
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Blood Sugar">Blood Sugar</option>
                  <option value="Heart Rate">Heart Rate</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Weight">Weight</option>
                  <option value="Oxygen Saturation">Oxygen Saturation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metric-value">Value</Label>
                  <Input
                    id="metric-value"
                    name="value"
                    type="number"
                    step="0.01"
                    value={metricForm.value}
                    onChange={handleMetricChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metric-unit">Unit</Label>
                  <Input
                    id="metric-unit"
                    name="unit"
                    placeholder="e.g. mmHg, mg/dL"
                    value={metricForm.unit}
                    onChange={handleMetricChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metric-measuredAt">Measured At</Label>
                <Input
                  id="metric-measuredAt"
                  name="measuredAt"
                  type="datetime-local"
                  value={metricForm.measuredAt}
                  onChange={handleMetricChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metric-notes">Notes</Label>
                <Textarea
                  id="metric-notes"
                  name="notes"
                  placeholder="Additional information..."
                  value={metricForm.notes}
                  onChange={handleMetricChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Health Metric</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 