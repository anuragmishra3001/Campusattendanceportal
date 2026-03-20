import { motion } from "framer-motion";
import { Briefcase, BookOpen, Mic, Lightbulb, PartyPopper } from "lucide-react";

const cases = [
  { icon: Briefcase, label: "Placement Drives" },
  { icon: BookOpen, label: "Workshops & Seminars" },
  { icon: Mic, label: "Guest Lectures" },
  { icon: Lightbulb, label: "Training Sessions" },
  { icon: PartyPopper, label: "College Events" },
];

export default function UseCasesSection() {
  return (
    <section id="use-cases" className="py-16 sm:py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Use Cases</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Perfect for Every Campus Event</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <c.icon className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground text-sm">{c.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
