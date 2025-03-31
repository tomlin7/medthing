import Dashboard from "@/components/Dashboard";
import { Sidebar } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Dashboard />
      </main>
    </div>
  );
}
