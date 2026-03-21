import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Search } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container px-4">
        <Card className="hero-gradient-bg border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)]" />
          <CardContent className="py-12 sm:py-16 text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
              Participating in an Event Today?
            </h2>
            <p className="text-primary-foreground/80 mt-3 max-w-lg mx-auto">
              Scan the QR code provided at the venue and mark your attendance instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button asChild size="lg" variant="secondary" className="h-12 px-8 font-semibold">
                <Link to="/attendance" className="gap-2">
                  Scan QR Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 px-8 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Link to="/attendance" className="gap-2">
                  <Search className="h-4 w-4" />
                  Check Attendance Status
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
