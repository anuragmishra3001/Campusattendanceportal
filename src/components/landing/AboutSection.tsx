import { motion } from "framer-motion";
import { Info } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="container px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl hero-gradient-bg mx-auto">
            <Info className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">About the Portal</h2>
          <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
            This portal is designed for students and faculty of IKGPTU to easily mark attendance during events using QR-based technology. It ensures accurate, fast, and transparent attendance without manual work.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
