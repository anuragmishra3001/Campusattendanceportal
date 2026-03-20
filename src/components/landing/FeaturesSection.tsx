import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, MapPin, ShieldAlert, BarChart3, Zap } from "lucide-react";

const features = [
  { icon: QrCode, title: "Secure QR-Based Attendance", desc: "Time-based QR codes prevent misuse and screenshot sharing." },
  { icon: MapPin, title: "Location Verification", desc: "Ensures attendance is marked only within campus premises." },
  { icon: ShieldAlert, title: "No Proxy Attendance", desc: "Prevents fake or duplicate entries with token validation." },
  { icon: BarChart3, title: "Real-Time Tracking", desc: "Admin can view attendance count and details instantly." },
  { icon: Zap, title: "Fast & Easy", desc: "Takes only a few seconds to scan and mark attendance." },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Why Use This Portal?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-border/60">
                <CardContent className="pt-6 pb-6 flex flex-col gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
