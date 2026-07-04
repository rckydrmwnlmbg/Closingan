import { Navbar } from "@/components/landing/Navbar";
import { HeroLanding } from "@/components/landing/HeroLanding";
import { ProblemStory } from "@/components/landing/ProblemStory";
import { EngineStory } from "@/components/landing/EngineStory";
import { HandoffStory } from "@/components/landing/HandoffStory";
import { DashboardLive } from "@/components/landing/DashboardLive";
import { BenefitSection } from "@/components/landing/BenefitSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTAFinal } from "@/components/landing/CTAFinal";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <Navbar />

      {/* Hero: Full viewport with background image + chat mockup */}
      <HeroLanding />

      {/* Story sections with whileInView animations */}
      <ProblemStory />
      <EngineStory />
      <HandoffStory />

      {/* Dashboard Preview (interactive) */}
      <DashboardLive />

      {/* Features, Benefits, Pricing */}
      <BenefitSection />
      <FeatureSection />
      <PricingSection />

      {/* Final CTA */}
      <CTAFinal />

      {/* Footer */}
      <Footer />
    </main>
  );
}
