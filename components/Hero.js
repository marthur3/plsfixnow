import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-black text-4xl lg:text-6xl tracking-tighter md:-mb-4 bg-gradient-to-r from-[#1B2A4A] via-[#2563EB] to-[#E87A1E] bg-clip-text text-transparent">
          Mark Up Slides & Dashboards in Seconds
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Stop sending vague emails about &quot;that chart on slide 12.&quot; Capture any PowerPoint slide or Power BI dashboard, drop numbered annotations on exact spots, and share crystal-clear feedback with your team instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="/demo"
            className="btn btn-secondary btn-wide"
          >
            See It In Action
          </a>
          <a
            href="https://chrome.google.com/webstore/detail/plsfix-thx"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-wide"
          >
            Get Started Free
          </a>
        </div>
        <div className="text-center sm:text-left">
          <span className="text-sm opacity-60">Built for analysts, consultants, and teams who review presentations daily</span>
        </div>

        <TestimonialsAvatars priority={true} />
      </div>
      <div className="lg:w-full">
        {/* TODO: Replace with actual product screenshot showing a PowerPoint slide with numbered annotations */}
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-2xl p-8 border border-slate-300">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <div className="w-3 h-3 bg-[#E87A1E] rounded-full"></div>
              <div className="w-3 h-3 bg-[#F59E0B] rounded-full"></div>
              <div className="w-3 h-3 bg-[#16A34A] rounded-full"></div>
              <span className="ml-2 text-xs text-gray-500 font-mono">Slide Markup Editor</span>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="relative">
                <div className="h-32 bg-gradient-to-br from-[#1B2A4A]/5 to-[#2563EB]/10 rounded border-2 border-dashed border-[#2563EB]/40 flex items-center justify-center">
                  <span className="text-[#1B2A4A] font-semibold">Annotated Slide</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#E87A1E] text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div className="absolute top-4 left-4 w-6 h-6 bg-[#DC2626] text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-[#16A34A] text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="flex-1 h-8 bg-[#2563EB]/10 rounded flex items-center px-2">
                  <span className="text-xs text-[#1B2A4A]">Add annotation</span>
                </div>
                <div className="h-8 w-20 bg-[#E87A1E] rounded flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">Export</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Visual feedback for slides and dashboards, made simple</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
