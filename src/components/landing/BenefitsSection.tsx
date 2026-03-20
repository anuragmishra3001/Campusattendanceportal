import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Saves time during events",
  "Accurate attendance records",
  "Secure and reliable system",
  "No paperwork required",
  "Easy mobile access for everyone",
];

export default function BenefitsSection() {
  return (
    <section className="py-16 sm:py-20 hero-gradient-subtle">
      <div className="container px-4">
        <div className="text-center mb-10">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Benefits</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Why It Matters</h2>
        </div>

        <div className="max-w-xl mx-auto space-y-4">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 bg-card rounded-xl px-5 py-4 border border-border/60 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span className="text-foreground font-medium text-sm sm:text-base">{b}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
