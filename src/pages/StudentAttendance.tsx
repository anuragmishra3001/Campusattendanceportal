import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { parseAttendanceParams } from "@/lib/token";
import { haversineDistance, DEFAULT_CAMPUS } from "@/lib/geo";
import { MapPin, User, CheckCircle2, XCircle, Loader2, QrCode } from "lucide-react";

type Step = "identity" | "location" | "submitting" | "success" | "error";

interface LocationData { latitude: number; longitude: number; accuracy: number; }

export default function StudentAttendance() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { eventId, token, timestamp } = parseAttendanceParams(searchParams.toString());

  const [step, setStep] = useState<Step>("identity");
  const [formData, setFormData] = useState({
    student_name: "",
    roll_no: "",
    course: "",
    section: "",
    mobile_no: "",
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!eventId || !token || !timestamp) {
      setStep("error");
      setErrorMessage("Invalid or missing QR code data. Please scan a valid QR code from your admin.");
    } else {
      const age = (Date.now() - timestamp) / 1000;
      if (age > 120) {
        setStep("error");
        setErrorMessage("This QR code has expired. Please scan the latest QR code.");
      }
    }
  }, [eventId, token, timestamp]);

  const requestLocation = () => {
    setIsLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setIsLocating(false);
      },
      (err) => {
        setLocationError(`Location error: ${err.message}. Please enable GPS and try again.`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleIdentitySubmit = () => {
    if (!Object.values(formData).every(v => v.trim())) return;
    setStep("location");
    requestLocation();
  };

  const handleSubmit = async () => {
    if (!location || isSubmitting) return;
    setIsSubmitting(true);
    
    // Preliminary frontend checks
    if (location.accuracy > 100) {
      setStep("error");
      setErrorMessage(`GPS accuracy too low (${Math.round(location.accuracy)}m). Please move to an open area and retry.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          event_id: eventId,
          token: token,
          timestamp: timestamp,
          lat: location.latitude,
          lng: location.longitude,
          gps_accuracy: location.accuracy,
          checkin_time: new Date().toISOString(),
          event_date: new Date().toISOString().split('T')[0]
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setStep("success");
      } else {
        setStep("error");
        setErrorMessage(result.error || "Submission failed");
      }
    } catch (err) {
      setStep("error");
      setErrorMessage("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardWrapper = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-nav text-nav-foreground">
        <div className="container flex items-center h-14 px-4 gap-2.5">
          <div className="h-8 w-8 rounded-lg hero-gradient-bg flex items-center justify-center">
            <QrCode className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">CampusCheck</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">{children}</Card>
      </div>
    </div>
  );

  if (step === "error") {
    return cardWrapper(
      <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Attendance Failed</h2>
        <p className="text-muted-foreground text-sm">{errorMessage}</p>
        <Button variant="outline" onClick={() => navigate("/")} className="mt-2">Go Back</Button>
      </CardContent>
    );
  }

  if (step === "success") {
    return cardWrapper(
      <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Attendance Recorded!</h2>
        <p className="text-muted-foreground text-sm">Your check-in for <span className="font-semibold text-foreground">{eventId}</span> has been verified.</p>
        <Button variant="outline" onClick={() => navigate("/")} className="mt-2">Done</Button>
      </CardContent>
    );
  }

  if (isSubmitting) {
    return cardWrapper(
      <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-lg font-bold text-foreground">Verifying attendance...</h2>
        <p className="text-sm text-muted-foreground">Checking token, GPS, and duplication rules.</p>
      </CardContent>
    );
  }

  if (step === "location") {
    return cardWrapper(
      <CardContent className="pt-6 pb-6 space-y-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Verify Your Location</h2>
          <p className="text-sm text-muted-foreground">We need to confirm you're on campus.</p>
        </div>
        {isLocating ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Getting location...</span>
          </div>
        ) : location ? (
          <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
            <p className="text-muted-foreground">Lat: <span className="font-mono text-foreground">{location.latitude.toFixed(6)}</span></p>
            <p className="text-muted-foreground">Lng: <span className="font-mono text-foreground">{location.longitude.toFixed(6)}</span></p>
            <p className="text-muted-foreground">Accuracy: <span className="font-mono text-foreground">{Math.round(location.accuracy)}m</span></p>
          </div>
        ) : null}
        {locationError && <p className="text-sm text-destructive text-center">{locationError}</p>}
        <div className="flex gap-2">
          {!location && !isLocating && (
            <Button onClick={requestLocation} className="flex-1 gap-2 hero-gradient-bg border-0 text-primary-foreground hover:opacity-90">
              <MapPin className="h-4 w-4" /> Allow Location
            </Button>
          )}
          {location && (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 gap-2 hero-gradient-bg border-0 text-primary-foreground hover:opacity-90">
              <CheckCircle2 className="h-4 w-4" /> {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </Button>
          )}
        </div>
      </CardContent>
    );
  }

  // Identity step
  return cardWrapper(
    <CardContent className="pt-6 pb-6 space-y-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Student Check-in</h2>
        <p className="text-sm text-muted-foreground">Event: <span className="font-semibold text-foreground">{eventId}</span></p>
      </div>
      <div className="space-y-3">
        <Input
          placeholder="Full Name"
          value={formData.student_name}
          onChange={e => setFormData({ ...formData, student_name: e.target.value })}
        />
        <Input
          placeholder="Roll Number"
          value={formData.roll_no}
          onChange={e => setFormData({ ...formData, roll_no: e.target.value })}
        />
        <Input
          placeholder="Course"
          value={formData.course}
          onChange={e => setFormData({ ...formData, course: e.target.value })}
        />
        <Input
          placeholder="Section"
          value={formData.section}
          onChange={e => setFormData({ ...formData, section: e.target.value })}
        />
        <Input
          placeholder="Mobile Number"
          type="tel"
          value={formData.mobile_no}
          onChange={e => setFormData({ ...formData, mobile_no: e.target.value })}
        />
      </div>
      <Button 
        onClick={handleIdentitySubmit} 
        disabled={!Object.values(formData).every(v => v.trim())} 
        className="w-full gap-2 hero-gradient-bg border-0 text-primary-foreground hover:opacity-90"
      >
        Continue
      </Button>
    </CardContent>
  );
}
