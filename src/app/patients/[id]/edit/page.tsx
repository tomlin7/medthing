"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getPatient, updatePatient, Patient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditPatientPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: "",
    dateOfBirth: "",
    gender: "",
    contact: "",
    address: "",
    bloodGroup: "",
    allergies: "",
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const response = await getPatient(params.id);
        
        if (response.success && response.data) {
          setPatient(response.data);
          setFormData({
            name: response.data.name || "",
            dateOfBirth: response.data.dateOfBirth || "",
            gender: response.data.gender || "",
            contact: response.data.contact || "",
            address: response.data.address || "",
            bloodGroup: response.data.bloodGroup || "",
            allergies: response.data.allergies || "",
          });
        } else {
          toast.error("Failed to load patient data");
          router.push("/patients");
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Failed to load patient data");
        router.push("/patients");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPatient();
    }
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dateOfBirth || !formData.gender || !formData.contact) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await updatePatient(params.id, formData);
      
      if (response.success) {
        toast.success("Patient updated successfully");
        router.push(`/patients/${params.id}`);
      } else {
        toast.error(response.message || "Failed to update patient");
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Failed to update patient");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Patient</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth?.split('T')[0]}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup || ""}
                    onValueChange={(value) => handleSelectChange("bloodGroup", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List any allergies here"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.push(`/patients/${params.id}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="mr-2">Saving</span>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
} 