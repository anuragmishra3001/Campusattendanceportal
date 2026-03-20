import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-nav text-nav-foreground sticky top-0 z-50 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg hero-gradient-bg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-base sm:text-lg">IKGPTU Attendance</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#about" className="text-nav-foreground/70 hover:text-nav-foreground transition-colors">About</a>
          <a href="#how-it-works" className="text-nav-foreground/70 hover:text-nav-foreground transition-colors">How It Works</a>
          <a href="#features" className="text-nav-foreground/70 hover:text-nav-foreground transition-colors">Features</a>
          <a href="#use-cases" className="text-nav-foreground/70 hover:text-nav-foreground transition-colors">Use Cases</a>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-nav-foreground/80 hover:text-nav-foreground hover:bg-nav-foreground/10">
            <Link to="/attend">Mark Attendance</Link>
          </Button>
          <Button asChild size="sm" className="hero-gradient-bg border-0 text-primary-foreground hover:opacity-90">
            <Link to="/admin">Admin Panel</Link>
          </Button>
        </div>

        <button className="md:hidden text-nav-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-nav border-t border-nav-foreground/10 px-4 pb-4 space-y-3">
          <a href="#about" className="block py-2 text-sm text-nav-foreground/70" onClick={() => setMobileOpen(false)}>About</a>
          <a href="#how-it-works" className="block py-2 text-sm text-nav-foreground/70" onClick={() => setMobileOpen(false)}>How It Works</a>
          <a href="#features" className="block py-2 text-sm text-nav-foreground/70" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#use-cases" className="block py-2 text-sm text-nav-foreground/70" onClick={() => setMobileOpen(false)}>Use Cases</a>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild size="sm" variant="outline" className="border-nav-foreground/20 text-nav-foreground">
              <Link to="/attend">Mark Attendance</Link>
            </Button>
            <Button asChild size="sm" className="hero-gradient-bg border-0 text-primary-foreground">
              <Link to="/admin">Admin Panel</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
