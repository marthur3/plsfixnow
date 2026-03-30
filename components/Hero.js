import Image from "next/image";
import config from "@/config";
import WebstoreLink from "./WebstoreLink";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-12 lg:py-24">
      <div className="flex flex-col gap-8 items-center justify-center text-center lg:text-left lg:items-start lg:max-w-xl">
        <h1 className="font-black text-4xl lg:text-6xl tracking-tighter bg-gradient-to-r from-[#1B2A4A] via-[#2563EB] to-[#E87A1E] bg-clip-text text-transparent">
          Stop typing &quot;the thing on the left.&quot;
        </h1>
        <p className="text-xl opacity-80 leading-relaxed">
          Capture any screen, drop numbered pins on exact spots, and give your AI or your team feedback they can actually act on. Free Chrome extension — installs in 3 seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          {config.extensionComingSoon ? (
            <span className="btn btn-primary btn-lg btn-wide btn-disabled !bg-primary/60">
              Coming Soon
            </span>
          ) : (
            <WebstoreLink placement="hero" className="btn btn-primary btn-lg btn-wide text-lg">
              Add to Chrome — It&apos;s Free
            </WebstoreLink>
          )}
        </div>
        <div className="flex flex-wrap gap-6 items-center justify-center lg:justify-start">
          <span className="flex items-center gap-1.5 text-sm text-base-content/60">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            No account needed
          </span>
          <span className="flex items-center gap-1.5 text-sm text-base-content/60">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            100% local — nothing uploaded
          </span>
          <span className="flex items-center gap-1.5 text-sm text-base-content/60">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Works with ChatGPT, Claude, Cursor
          </span>
        </div>
      </div>
      <div className="lg:w-full">
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-300">
          <Image
            src="/hero/New Note.jpeg"
            alt="Annotated slide with numbered feedback markers"
            className="rounded-xl shadow-lg w-full h-auto"
            width={1440}
            height={900}
            priority
          />
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500">Click anywhere to drop numbered annotations</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
