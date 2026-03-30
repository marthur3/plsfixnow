import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PrivacySecurity from "@/components/PrivacySecurity";
import StickyInstallBar from "@/components/StickyInstallBar";
import HowItWorks from "@/components/HowItWorks";
import { getSEOTags, renderSchemaTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "PLSFIX-THX — Point at Exactly What Needs Fixing",
  description:
    "Free Chrome extension. Capture your screen, drop numbered annotations on exact spots, and give your AI or team crystal-clear feedback in seconds. No account required.",
  canonicalUrlRelative: "/",
});

export default function Home() {
  return (
    <>
      {renderSchemaTags()}
      <Suspense>
        <Header />
      </Suspense>
      <main className="pb-20 lg:pb-0">
        <Hero />
        <Problem />
        <HowItWorks />
        <FeaturesAccordion />
        <PrivacySecurity />
        <FAQ />
        <CTA />
      </main>
      <StickyInstallBar />
      <Footer />
    </>
  );
}
