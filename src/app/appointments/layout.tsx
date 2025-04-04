"use client";

import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export default function AppointmentsLayout({ children }: { children: ReactNode }) {
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