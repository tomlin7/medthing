"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return null; // Or redirect to login
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
} 