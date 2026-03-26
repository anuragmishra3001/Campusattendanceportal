import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList } from "lucide-react";

export interface AttendanceRecord {
  studentId: string;
  eventId: string;
  checkinTime: string;
  status: "verified" | "rejected" | "proxy_blocked" | "outside_range" | "duplicate";
  lat?: number;
  lng?: number;
  accuracy?: number;
  studentName?: string;
  course?: string;
  section?: string;
  mobileNo?: string;
}

const statusConfig: Record<AttendanceRecord["status"], { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  proxy_blocked: { label: "Proxy Blocked", className: "bg-destructive/10 text-destructive border-destructive/20" },
  outside_range: { label: "Outside Range", className: "bg-warning/10 text-warning border-warning/20" },
  duplicate: { label: "Duplicate", className: "bg-warning/10 text-warning border-warning/20" },
};

interface AttendanceLogProps {
  records: AttendanceRecord[];
}

export function AttendanceLog({ records }: AttendanceLogProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-4 w-4" />
          Real-time Attendance Log
          <Badge variant="secondary" className="ml-auto">{records.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] sm:h-[400px]">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Student Name</TableHead>
                  <TableHead className="font-semibold">Roll No</TableHead>
                  <TableHead className="font-semibold">Mobile No</TableHead>
                  <TableHead className="font-semibold">Time</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Course/Sec</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No attendance records yet
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record, index) => {
                    const config = statusConfig[record.status];
                    return (
                      <TableRow key={record.studentId + index}>
                        <TableCell className="font-medium text-sm">{record.studentName || "N/A"}</TableCell>
                        <TableCell className="text-sm">{record.studentId}</TableCell>
                        <TableCell className="text-sm">{record.mobileNo || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {record.checkinTime}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${config.className}`}>
                            {config.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {record.course} / {record.section}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
