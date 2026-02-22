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
import { getSEOTags, renderSchemaTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "PLSFIX-THX — Mark Up Slides & Dashboards in Seconds",
  description:
    "PLSFIX-THX is a free Chrome extension for screenshot annotation. Capture slides and dashboards, add numbered annotations, and share crystal-clear feedback with your team instantly.",
  canonicalUrlRelative: "/",
});

export default function Home() {
  return (
    <>
      {renderSchemaTags()}
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <ExtensionInstall />
        <Problem />
        <FeaturesAccordion />
        <FeatureComparison />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}