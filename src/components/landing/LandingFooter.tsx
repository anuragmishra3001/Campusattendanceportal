import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-nav text-nav-foreground py-10">
      <div className="container px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg hero-gradient-bg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">IKGPTU Attendance Portal</span>
          </div>
          <p className="text-sm text-nav-foreground/50">Developed for IKGPTU Students</p>
          <div className="flex items-center gap-4 text-xs text-nav-foreground/40">
            <a href="#" className="hover:text-nav-foreground/70 transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-nav-foreground/70 transition-colors">Terms of Use</a>
            <span>|</span>
            <Link to="/admin" className="hover:text-nav-foreground/70 transition-colors opacity-30 hover:opacity-100">Admin Login</Link>
          </div>
          <p className="text-xs text-nav-foreground/30">© {new Date().getFullYear()} IKGPTU Attendance Portal</p>
        </div>
      </div>
    </footer>
  );
}
