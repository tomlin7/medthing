"use client";

import { FileText, Database, Activity, Heart, Lock, ArrowRight, Bell, Plus, Stethoscope, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FeatureCard = ({ icon: Icon, title, description }: { 
  icon: React.ElementType, 
  title: string, 
  description: string
}) => {
  return (
    <div className="p-6 h-full border rounded-xl bg-card">
      <div className="mb-6 text-primary bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      {/* <div className="mt-4 flex justify-end">
        <ArrowRight className="h-5 w-5 text-primary" />
      </div> */}
    </div>
  );
};

export default function HeroSection() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col space-y-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center">
                <Stethoscope className="h-12 w-12 text-primary" />
              </div>
              
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  MedThing
                </h1>
                
                <h2 className="text-2xl md:text-3xl font-medium mb-8 text-primary">
                  AI-Powered Medical Reports
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-lg mb-10">
                  Revolutionize your medical practice with our AI-powered platform. Generate comprehensive reports, analyze patient data, and improve healthcare outcomes seamlessly.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5 mb-8">
                  <Button asChild size="lg" className="px-8 py-6 text-lg">
                    <Link href="/auth">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Content - Medical Plus Symbol */}
            <div className="flex justify-center items-center">
              <div className="relative w-72 h-72 flex items-center justify-center">
                {/* Dark gloomy background */}
                <div className="absolute w-full h-full rounded-full bg-red-600/20 blur-3xl"></div>
                
                {/* Glow effects */}
                {/* <div className="absolute w-4/5 h-4/5 rounded-full bg-red/10 blur-3xl opacity-70"></div> */}
                <div className="absolute w-3/5 h-3/5 rounded-full bg-red-700/16 blur-2xl opacity-80"></div>
                <div className="absolute w-2/5 h-2/5 rounded-full bg-red-700/16 blur-xl opacity-90"></div> 
                
                {/* Plus symbol */}
                <div className="relative z-10 rounded-xl w-44 h-44 flex items-center justify-center">
                  <HeartPulse className="h-32 w-32 text-red-900" strokeWidth={1.5} />
                </div>
                
                {/* Outer glow rings */}
                <div className="absolute w-120 h-120 border-2 border-red-800/20 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute w-110 h-110 border-2 border-red-800/20 rounded-full animate-pulse delay-1200"></div>
                <div className="absolute w-100 h-100 border-2 border-red-800/20 rounded-full animate-pulse delay-1400"></div>
                <div className="absolute w-90 h-90 border-2 border-red-800/20 rounded-full animate-pulse delay-1600"></div>
                <div className="absolute w-80 h-80 border-2 border-red-800/20 rounded-full animate-pulse delay-1800"></div>
                <div className="absolute w-70 h-70 border-2 border-red-800/20 rounded-full animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats section */}
      {/* <div className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <span>1,250</span>+
              </div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <span>32,500</span>+
              </div>
              <p className="text-muted-foreground">Reports Generated</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <span>24</span>/7
              </div>
              <p className="text-muted-foreground">Support Available</p>
            </div>
          </div>
        </div>
      </div>
       */}
      {/* Features section */}
      <div id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Powerful Features
          </h2>
          
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16">
            Everything you need to streamline your medical reporting workflow and enhance patient care
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Activity} 
              title="AI-Powered Reports" 
              description="Generate comprehensive medical reports using advanced AI to analyze patient data and provide relevant insights."
            />
            <FeatureCard 
              icon={Heart} 
              title="Patient Analytics" 
              description="Track and visualize patient health metrics over time with interactive charts and actionable insights."
            />
            <FeatureCard 
              icon={Database} 
              title="Data Organization" 
              description="Keep all your patient records organized and easily accessible in one secure location."
            />
            <FeatureCard 
              icon={Bell} 
              title="Real-time Alerts" 
              description="Receive instant notifications about critical patient information, lab results, and scheduling updates."
            />
            <FeatureCard 
              icon={Lock} 
              title="Secure Access" 
              description="Control who has access to sensitive patient information with role-based permissions."
            />
            <FeatureCard 
              icon={FileText} 
              title="Custom Templates" 
              description="Create and save custom report templates tailored to your specialty and workflow."
            />
          </div>
        </div>
      </div>
    </div>
  );
}