import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildAttendanceUrl } from "@/lib/token";
import { Progress } from "@/components/ui/progress";

interface QRCodeDisplayProps {
  eventId: string;
  isActive: boolean;
  refreshInterval?: number;
}

export function QRCodeDisplay({ eventId, isActive, refreshInterval = 60 }: QRCodeDisplayProps) {
  const [qrUrl, setQrUrl] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(refreshInterval);
  const [key, setKey] = useState(0);

  const generateToken = useCallback(async () => {
    if (!isActive || !eventId) return;
    try {
      const response = await fetch(`/api/token?event_id=${eventId}`);
      const { token, timestamp } = await response.json();
      const baseUrl = window.location.origin;
      const url = buildAttendanceUrl(baseUrl, eventId, token, timestamp);
      setQrUrl(url);
      setSecondsLeft(refreshInterval);
      setKey(prev => prev + 1);
    } catch (err) {
      console.error("Failed to fetch token from backend:", err);
    }
  }, [eventId, isActive, refreshInterval]);

  useEffect(() => {
    if (!isActive) return;
    generateToken();
    const interval = setInterval(generateToken, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [generateToken, isActive, refreshInterval]);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev <= 1 ? refreshInterval : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, refreshInterval]);

  const progressPercent = (secondsLeft / refreshInterval) * 100;

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-lg border-2 border-dashed border-border bg-muted/50">
        <p className="text-muted-foreground font-medium text-sm sm:text-base text-center">Start a session to generate QR code</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div key={key} className="qr-fade-in bg-card p-4 sm:p-6 rounded-xl shadow-lg border border-border">
        {qrUrl && (
          <QRCodeSVG
            value={qrUrl}
            size={220}
            level="H"
            includeMargin
            bgColor="hsl(0, 0%, 100%)"
            fgColor="hsl(222, 47%, 11%)"
            className="w-[180px] h-[180px] sm:w-[250px] sm:h-[250px]"
          />
        )}
      </div>
      <div className="w-full max-w-[320px] space-y-2">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-center text-sm text-muted-foreground font-medium">
          Refreshing in <span className="font-bold text-foreground">{secondsLeft}s</span>
        </p>
      </div>
    </div>
  );
}
