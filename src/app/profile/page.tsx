"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserCircle, Mail, Award, IdCard, Key } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    specialization: user?.specialization || "",
    licenseNumber: user?.licenseNumber || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Function to get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // This would normally make an API call to update the profile
    // For now, we'll just show a success toast
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Profile updated successfully");
      // In a real app, you would update the user context here after API success
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to update password");
      console.error("Error updating password:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-6 pb-8">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarFallback className="text-3xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.specialization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">License: {user.licenseNumber}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="w-full" onClick={logout}>
                Log Out
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <form onSubmit={handleProfileUpdate}>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Update your personal and professional information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Specialization
                      </Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        value={profileData.specialization}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                        <IdCard className="h-4 w-4" />
                        License Number
                      </Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={profileData.licenseNumber}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
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
            </TabsContent>
            
            <TabsContent value="password">
              <Card>
                <form onSubmit={handlePasswordUpdate}>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <span className="mr-2">Updating</span>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 