import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Settings, MapPin, Loader2 } from "lucide-react";

interface SessionControlsProps {
  isActive: boolean;
  eventId: string;
  onStart: (eventId: string, lat?: number, lng?: number) => void;
  onStop: () => void;
}

export function SessionControls({ isActive, eventId, onStart, onStop }: SessionControlsProps) {
  const [inputEventId, setInputEventId] = useState(eventId || "");
  const [venueLocation, setVenueLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getVenueLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setVenueLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGettingLocation(false);
      },
      (err) => {
        console.error("Location error:", err);
        setIsGettingLocation(false);
        alert("Failed to get location. Please ensure GPS is enabled.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleStart = () => {
    if (inputEventId.trim()) {
      onStart(inputEventId.trim(), venueLocation?.lat, venueLocation?.lng);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          Session Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Event ID (e.g., CS101-2024-03-19)"
          value={inputEventId}
          onChange={e => setInputEventId(e.target.value)}
          disabled={isActive}
        />
        {!isActive && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={getVenueLocation} 
            disabled={isGettingLocation}
            className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary"
          >
            {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {venueLocation ? "Location Set (100m Geofence Active)" : "Set Venue Location (Optional Geofence)"}
          </Button>
        )}
        {!isActive ? (
          <Button onClick={handleStart} disabled={!inputEventId.trim()} className="w-full gap-2 hero-gradient-bg border-0 text-primary-foreground hover:opacity-90">
            <Play className="h-4 w-4" />
            Start Session
          </Button>
        ) : (
          <Button onClick={onStop} variant="destructive" className="w-full gap-2">
            <Square className="h-4 w-4" />
            Stop Session
          </Button>
        )}
        {isActive && (
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-success status-pulse" />
            <span className="text-muted-foreground">
              Session active: <span className="font-semibold text-foreground">{eventId}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
