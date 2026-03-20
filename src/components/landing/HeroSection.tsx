import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" }
  })
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient-subtle" />
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative px-4 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <CalendarCheck className="h-4 w-4" />
              I.K. Gujral Punjab Technical University
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            IKGPTU Event{" "}
            <span className="gradient-text">Attendance Portal</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            A smart and secure way to mark attendance for university events, seminars, and placement drives.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-3 text-sm font-semibold text-primary"
            initial="hidden" animate="visible" variants={fadeUp} custom={2.5}
          >
            <span>Quick</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span>Secure</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span>Transparent</span>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <Button asChild size="lg" className="h-12 px-8 text-base hero-gradient-bg border-0 text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20">
              <Link to="/attend" className="gap-2">
                Mark Attendance
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link to="/admin">View Events</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
