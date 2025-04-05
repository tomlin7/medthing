"use client";

import HeroSection from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import LandingNav from "@/components/LandingNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// CTA Section
const CtaSection = () => {
  return (
    <div className="py-20 lg:py-32 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Transform Your Medical Practice?
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who are already 
            streamlining their workflows and delivering better patient care.
          </p>
          
          <Button asChild size="lg" className="px-8 py-7 text-lg">
            <Link href="/auth">Get Started Today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);
  
  return (
    <main>
      <LandingNav />
      <HeroSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
