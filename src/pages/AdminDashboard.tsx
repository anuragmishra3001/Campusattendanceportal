import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { SessionControls } from "@/components/SessionControls";
import { AttendanceLog, type AttendanceRecord } from "@/components/AttendanceLog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Users, CheckCircle2, XCircle, QrCode, ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
  const [isActive, setIsActive] = useState(false);
  const [eventId, setEventId] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const handleStart = useCallback((id: string) => {
    setEventId(id);
    setIsActive(true);
    setRecords([]);
  }, []);

  const handleStop = useCallback(() => setIsActive(false), []);

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ["Student ID", "Event ID", "Check-in Time", "Status", "Latitude", "Longitude", "Accuracy"];
    const rows = records.map(r => [r.studentId, r.eventId, r.checkinTime, r.status, r.lat || "", r.lng || "", r.accuracy || ""]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${eventId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const verified = records.filter(r => r.status === "verified").length;
  const rejected = records.filter(r => r.status !== "verified").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-nav text-nav-foreground border-b border-sidebar-border sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="text-nav-foreground/70 hover:text-nav-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-8 w-8 rounded-lg hero-gradient-bg flex items-center justify-center">
              <QrCode className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-sm sm:text-lg truncate">CampusCheck</h1>
          </div>
          <Badge variant="outline" className="border-nav-foreground/20 text-nav-foreground shrink-0 hidden sm:inline-flex">
            Admin Dashboard
          </Badge>
        </div>
      </header>

      <main className="container px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{records.length}</p>
                <p className="text-xs text-muted-foreground">Total Submissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SessionControls isActive={isActive} eventId={eventId} onStart={handleStart} onStop={handleStop} />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QRCodeDisplay eventId={eventId} isActive={isActive} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={records.length === 0} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <AttendanceLog records={records} />
          </div>
        </div>
      </main>
    </div>
  );
}
