import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, ClipboardList, Briefcase } from "lucide-react";

const users = [
  { icon: GraduationCap, title: "Students", desc: "Mark attendance quickly at any campus event." },
  { icon: BookOpen, title: "Faculty", desc: "Track student presence for lectures and labs." },
  { icon: ClipboardList, title: "Event Coordinators", desc: "Manage and monitor event attendance live." },
  { icon: Briefcase, title: "Placement & Training Teams", desc: "Verify candidate attendance for drives." },
];

export default function WhoCanUseSection() {
  return (
    <section className="py-16 sm:py-20 hero-gradient-subtle">
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Who Can Use</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Built for Everyone on Campus</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {users.map((u, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full text-center hover:shadow-md transition-shadow border-border/60">
                <CardContent className="pt-6 pb-6 flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl hero-gradient-bg flex items-center justify-center">
                    <u.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground">{u.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{u.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
