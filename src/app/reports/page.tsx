"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getReports } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from "next/link";
import { FileText, FileDown, Printer } from "lucide-react";
import { toast } from "sonner";

type Report = {
  id: string;
  patientId: string;
  patientName: string;
  reportType: string;
  generatedAt: string;
  status: string;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await getReports();
      setReports(response.data);
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI Generated Reports</h1>
        </div>
        
        {isLoading ? (
          <div className="text-center p-8">
            <div className="h-6 w-24 mx-auto bg-muted animate-pulse rounded mb-4"></div>
            <div className="h-4 w-48 mx-auto bg-muted animate-pulse rounded"></div>
          </div>
        ) : reports && reports.length === 0 ? (
          <div className="text-center p-12 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">Generate a report from a patient's profile</p>
            <Button asChild>
              <Link href="/patients">Go to Patients</Link>
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <Link href={`/patients/${report.patientId}`} className="hover:underline">
                        {report.patientName}
                      </Link>
                    </TableCell>
                    <TableCell>{report.reportType}</TableCell>
                    <TableCell>{formatDate(report.generatedAt)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                        {report.status === 'processing' ? (
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-ping"></span>
                            Processing...
                          </span>
                        ) : report.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild disabled={report.status === 'processing'}>
                        <Link href={`/reports/${report.id}`} className={report.status === 'processing' ? 'pointer-events-none opacity-50' : ''}>
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" disabled={report.status === 'processing'}>
                        <Link href={`/reports/${report.id}#download`} className={`flex items-center ${report.status === 'processing' ? 'pointer-events-none opacity-50' : ''}`}>
                          <FileDown className="h-4 w-4 mr-1" />
                          Download
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" disabled={report.status === 'processing'}>
                        <Link href={`/reports/${report.id}#print`} className={`flex items-center ${report.status === 'processing' ? 'pointer-events-none opacity-50' : ''}`}>
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
} 