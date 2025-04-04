"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If no user and we're on the client, redirect to login
    if (!user && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [user, router]);

  // Don't render anything until we check auth status
  if (typeof window !== 'undefined' && !user) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
} 