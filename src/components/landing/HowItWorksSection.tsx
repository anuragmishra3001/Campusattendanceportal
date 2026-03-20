import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Smartphone, UserCheck, ShieldCheck, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: QrCode, title: "QR Displayed", desc: "QR code is displayed during the event by the coordinator." },
  { icon: Smartphone, title: "Scan QR", desc: "Students scan the QR code using their mobile phone camera." },
  { icon: UserCheck, title: "Enter Details", desc: "Enter student ID and allow location access for verification." },
  { icon: ShieldCheck, title: "Verify", desc: "System verifies identity, location, and token validity." },
  { icon: CheckCircle2, title: "Recorded", desc: "Attendance is recorded instantly and visible to admin." },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 hero-gradient-subtle">
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Simple 5-Step Process</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">From QR display to recorded attendance in seconds.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full text-center border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-6 flex flex-col items-center gap-3">
                  <span className="text-xs font-bold text-primary/60 tracking-widest">STEP {i + 1}</span>
                  <div className="h-12 w-12 rounded-xl hero-gradient-bg flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
