import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import ExtensionInstall from "@/components/ExtensionInstall";
import FeatureComparison from "@/components/FeatureComparison";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ProofStrip from "@/components/ProofStrip";
import PrivacySecurity from "@/components/PrivacySecurity";
import StickyInstallBar from "@/components/StickyInstallBar";
import { getSEOTags, renderSchemaTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "PLSFIX-THX — Mark Up Slides & Dashboards in Seconds",
  description:
    "PLSFIX-THX is a free Chrome extension with every premium feature unlocked. Capture slides and dashboards, add numbered annotations, copy for AI, and share crystal-clear feedback instantly.",
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
        <ProofStrip />
        <ExtensionInstall />
        <Problem />
        <FeaturesAccordion />
        <FeatureComparison />
        <PrivacySecurity />
        <FAQ />
        <Pricing />
        <CTA />
      </main>
      <StickyInstallBar />
      <Footer />
    </>
  );
}
