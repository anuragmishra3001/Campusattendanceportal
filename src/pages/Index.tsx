import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhoCanUseSection from "@/components/landing/WhoCanUseSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import CTASection from "@/components/landing/CTASection";
import SupportSection from "@/components/landing/SupportSection";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WhoCanUseSection />
      <UseCasesSection />
      <BenefitsSection />
      <CTASection />
      <SupportSection />
      <LandingFooter />
    </div>
  );
}
