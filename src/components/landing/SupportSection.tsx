import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

export default function SupportSection() {
  return (
    <section className="py-16 sm:py-20 hero-gradient-subtle">
      <div className="container px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Need Help?</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you face any issues while marking attendance, contact your event coordinator or the placement cell for assistance.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
