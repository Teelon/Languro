import Audience from "@/components/Languro/Audience";
import Comparison from "@/components/Languro/Comparison";
import Conversion from "@/components/Languro/Conversion";
import CoreModules from "@/components/Languro/CoreModules";
import Footer from "@/components/Languro/Footer";
import Hero from "@/components/Languro/Hero";
import HowItWorks from "@/components/Languro/HowItWorks";
import Philosophy from "@/components/Languro/Philosophy";
import Problem from "@/components/Languro/Problem";
import SocialProof from "@/components/Languro/SocialProof";
import ValueProposition from "@/components/Languro/ValueProposition";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Languro - The Language Gym",
  description: "The serious language learning engine for real proficiency. Train morphology, syntax, and literacy with AI-powered drills.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <ValueProposition />
      <HowItWorks />
      <CoreModules />
      <Comparison />
      <Audience />
      <Philosophy />
      <SocialProof />
      <Conversion />
      <Footer />
    </main>
  );
}
