import HeroSection from "@/components/landing/HeroSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import WorkflowSection from "@/components/landing/WorkflowSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <main className="relative pt-24 overflow-hidden min-h-screen">
      {/* Background Accents (Shared across Hero but extends to the background) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2"></div>
      
      <HeroSection />
      <FeatureGrid />
      <WorkflowSection />
      <ShowcaseSection />
      <LandingFooter />
    </main>
  );
}
