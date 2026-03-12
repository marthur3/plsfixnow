import Image from "next/image";
import config from "@/config";
import WebstoreLink from "./WebstoreLink";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-black text-4xl lg:text-6xl tracking-tighter md:-mb-4 bg-gradient-to-r from-[#1B2A4A] via-[#2563EB] to-[#E87A1E] bg-clip-text text-transparent">
          Add to Chrome. Mark up slides in seconds.
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Install once, then capture any PowerPoint slide or Power BI dashboard, drop numbered annotations on exact spots, and send crystal-clear feedback with zero back-and-forth.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {config.extensionComingSoon ? (
            <span className="btn btn-primary btn-wide btn-disabled !bg-primary/60">
              Coming Soon
            </span>
          ) : (
            <WebstoreLink placement="hero" className="btn btn-primary btn-wide">
              Add to Chrome — Free
            </WebstoreLink>
          )}
          <a href="/demo" className="btn btn-secondary btn-wide">
            See Live Demo
          </a>
        </div>
        {!config.extensionComingSoon && (
          <div className="flex items-center gap-2 text-xs text-base-content/60">
            <span className="inline-flex items-center gap-2 rounded-full bg-base-200 px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Chrome Web Store
            </span>
            <span>Official listing</span>
          </div>
        )}
        <div className="text-sm opacity-70">
          No account required • 100% local • Chrome 88+
        </div>
        <div className="text-center sm:text-left">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="flex items-center gap-1.5 text-sm opacity-60">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              100% local processing
            </span>
            <span className="flex items-center gap-1.5 text-sm opacity-60">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Free to use
            </span>
            <span className="flex items-center gap-1.5 text-sm opacity-60">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Works with any AI tool
            </span>
          </div>
        </div>
      </div>
      <div className="lg:w-full">
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-2xl p-6 border border-slate-300">
          <Image
            src="/hero/New Note.jpeg"
            alt="Annotated slide with numbered feedback markers"
            className="rounded-xl shadow-lg w-full h-auto"
            width={1440}
            height={900}
            priority
          />
          <div className="text-center mt-4">
            <span className="text-xs text-gray-500">Numbered annotations pinpoint exact fixes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
