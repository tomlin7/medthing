"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AuthForm() {
  const { login, signup, isLoading, error, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupSpecialization, setSignupSpecialization] = useState("");
  const [signupLicenseNumber, setSignupLicenseNumber] = useState("");
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
    
    // Check for tab parameter in URL
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setActiveTab('signup');
    } else if (tabParam === 'login') {
      setActiveTab('login');
    }
  }, [user, router]);
  
  // Show error toast when auth error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      // This will redirect on success via the auth context
      await login(loginEmail, loginPassword);
    } catch (err) {
      // Errors are handled by the auth context and displayed via the error state
      console.error("Login failed:", err);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!signupEmail || !signupPassword || !signupName || !signupSpecialization || !signupLicenseNumber) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Password strength validation
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      // This will redirect on success via the auth context
      await signup({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        specialization: signupSpecialization,
        licenseNumber: signupLicenseNumber,
      });
    } catch (err) {
      // Errors are handled by the auth context and displayed via the error state
      console.error("Signup failed:", err);
    }
  };

  const handleGuestLogin = async () => {
    const guestEmail = "guest@example.com";
    const guestPassword = "guest123";
    setLoginEmail(guestEmail);
    setLoginPassword(guestPassword);
  
    try {
      await login(guestEmail, guestPassword);
    } catch (err) {
      toast.error("Guest login failed. Try again.");
    }
  };
  
   
  return (
    <div className="w-full max-w-md">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="doctor@example.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login as Guest"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Register as a new doctor
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="doctor@example.com" 
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Dr. John Doe" 
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input 
                    id="specialization" 
                    type="text" 
                    placeholder="Cardiology" 
                    value={signupSpecialization}
                    onChange={(e) => setSignupSpecialization(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input 
                    id="license" 
                    type="text" 
                    placeholder="MD12345" 
                    value={signupLicenseNumber}
                    onChange={(e) => setSignupLicenseNumber(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full mt-5" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 