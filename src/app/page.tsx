import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import PrivacyTimeline from "@/components/landing/PrivacyTimeline";
import Workflow from "@/components/landing/Workflow";
import WhyCanton from "@/components/landing/WhyCanton";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <PrivacyTimeline />
      <Workflow />
      <WhyCanton />
      <CTA />
      <Footer />
    </>
  );
}