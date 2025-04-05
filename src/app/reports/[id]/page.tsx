"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReport } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  FileDown, 
  Printer, 
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Tag,
  LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface ReportSection {
  title: string;
  content: string;
}

type Report = {
  id: string;
  patientId: string;
  patientName: string;
  patientInfo: {
    age: number;
    gender: string;
    dateOfBirth: string;
  };
  reportType: string;
  summary: string;
  sections: ReportSection[];
  recommendations: string[];
  generatedAt: string;
  status: string;
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        
        const reportData = await getReport(reportId);
        setReport(reportData.data);
        
        // Check if URL has hash for automatic actions
        if (window.location.hash) {
          // Allow time for component to render
          setTimeout(() => {
            if (window.location.hash === '#download') {
              handleDownloadPDF();
            } else if (window.location.hash === '#print') {
              handlePrint();
            }
            
            // Remove the hash to prevent repeated actions on refresh
            window.history.replaceState(
              null, 
              document.title, 
              window.location.pathname
            );
          }, 1000);
        }
      } catch (error) {
        toast.error("Failed to load report");
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [reportId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle printing functionality
  const handlePrint = () => {
    try {
      setIsPrinting(true);
      
      // Add print-specific styles
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content, #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Trigger browser print
      setTimeout(() => {
        window.print();
        
        // Remove the style after printing
        document.head.removeChild(style);
        setIsPrinting(false);
        toast.success("Report printed successfully");
      }, 500);
    } catch (error) {
      console.error("Error printing report:", error);
      setIsPrinting(false);
      toast.error("Failed to print report");
    }
  };
  
  // Handle PDF download functionality
  const handleDownloadPDF = async () => {
    if (!report) return;
    
    try {
      setIsDownloading(true);
      
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set some basic styling
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Helper function to add multi-line text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * lineHeight);
      };
      
      // Add header with logo placeholder
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Medical Report", margin, 20);
      
      // Add report type
      pdf.setFontSize(16);
      pdf.text(report.reportType, margin, 30);
      
      // Add generated date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${formatDate(report.generatedAt)} at ${formatTime(report.generatedAt)}`, margin, 35);
      
      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, 40, pageWidth - margin, 40);
      
      // Add patient information
      let yPos = 50;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Patient Information", margin, yPos);
      yPos += 7;
      
      pdf.setFontSize(10);
      pdf.text(`Name: ${report.patientName}`, margin, yPos);
      yPos += 5;
      pdf.text(`Gender: ${report.patientInfo.gender}`, margin, yPos);
      yPos += 5;
      pdf.text(`Age: ${report.patientInfo.age} years`, margin, yPos);
      yPos += 10;
      
      // Add executive summary
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Executive Summary", margin, yPos);
      yPos += 7;
      
      pdf.setFontSize(10);
      yPos = addWrappedText(report.summary, margin, yPos, contentWidth, 5) + 10;
      
      // Add sections
      if (report.sections && report.sections.length > 0) {
        report.sections.forEach((section) => {
          // Check if we need a new page
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(section.title, margin, yPos);
          yPos += 7;
          
          pdf.setFontSize(10);
          // Remove any HTML tags from the content
          const plainText = section.content.replace(/<[^>]*>/g, '');
          yPos = addWrappedText(plainText, margin, yPos, contentWidth, 5) + 10;
        });
      }
      
      // Add recommendations
      if (report.recommendations && report.recommendations.length > 0) {
        // Check if we need a new page
        if (yPos > 220) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Recommendations", margin, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        report.recommendations.forEach((recommendation, index) => {
          // Check if we need a new page
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          
          const bulletPoint = `• ${recommendation}`;
          yPos = addWrappedText(bulletPoint, margin, yPos, contentWidth, 5) + 5;
        });
      }
      
      // Add disclaimer at the bottom of the last page
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        "This is an AI-generated report. Please consult with a healthcare professional before making any medical decisions.", 
        margin, 
        285
      );
      
      pdf.save(`${report.patientName.replace(/\s+/g, '_')}_medical_report.pdf`);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading report...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
              <p className="text-muted-foreground mb-4">The report you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push('/reports')}>
                Back to Reports
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const ReportMetaItem = ({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string }) => (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}:</span>
      <span className="text-sm">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/reports')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{report.reportType}</h1>
              <p className="text-muted-foreground">
                AI-generated report for {report.patientName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Printing...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div ref={reportRef} id="report-content" className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
              <CardDescription>Details about this report and patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Patient Details</h3>
                    <ReportMetaItem 
                      icon={User} 
                      label="Name" 
                      value={report.patientName} 
                    />
                    <ReportMetaItem 
                      icon={User} 
                      label="Gender" 
                      value={report.patientInfo.gender} 
                    />
                    <ReportMetaItem 
                      icon={User} 
                      label="Age" 
                      value={`${report.patientInfo.age} years`} 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Report Details</h3>
                    <ReportMetaItem 
                      icon={Tag} 
                      label="Type" 
                      value={report.reportType} 
                    />
                    <ReportMetaItem 
                      icon={Calendar} 
                      label="Date" 
                      value={formatDate(report.generatedAt)} 
                    />
                    <ReportMetaItem 
                      icon={Clock} 
                      label="Time" 
                      value={formatTime(report.generatedAt)} 
                    />
                  </div>
                </div>
                
                <div className="md:text-right space-y-4">
                  <div className="inline-block rounded-lg px-4 py-2 bg-primary/10 text-primary">
                    <p className="text-sm font-medium text-center">AI-Generated Report ✨</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on patient records and medical history
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{report.summary}</p>
              </div>
            </CardContent>
          </Card>
          
          {report.sections && report.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <ul className="list-disc pl-6 space-y-2">
                  {report.recommendations && report.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>This is an AI-generated report. Please consult with a healthcare professional before making any medical decisions.</p>
          </div>
        </div>
      </main>
    </div>
  );
} 