"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import LandingNav from "@/components/LandingNav";
import { Footer } from "@/components/Footer";

export default function AuthPage() {
  return (
    <div>
      <LandingNav />
      
      <div className="min-h-[calc(100vh-80px)] w-full py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <Link 
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to home
              </Link>
              
              <h2 className="mt-6 text-3xl font-bold">
                Welcome to MedThing
              </h2>
              <p className="mt-2 text-muted-foreground">
                Sign in to your account or create a new one
              </p>
            </div>
            
            <div className="mt-8">
              <AuthForm />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 