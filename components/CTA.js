import config from "@/config";
import WebstoreLink from "./WebstoreLink";

const CTA = () => {
  return (
    <section className="bg-primary text-primary-content">
      <div className="max-w-4xl mx-auto px-8 py-20 md:py-28 text-center">
        <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-6">
          Your next AI prompt deserves a screenshot, not a paragraph.
        </h2>
        <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">
          Install the free Chrome extension. Capture, annotate, share — in under 10 seconds. No account, no uploads, no catch.
        </p>

        {config.extensionComingSoon ? (
          <span className="btn btn-secondary btn-lg btn-wide btn-disabled !bg-secondary/60">
            Coming Soon
          </span>
        ) : (
          <WebstoreLink placement="cta" className="btn btn-secondary btn-lg btn-wide text-lg">
            Add to Chrome — It&apos;s Free
          </WebstoreLink>
        )}

        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm opacity-70">
          <span>No sign-up needed</span>
          <span>Chrome 88+</span>
          <span>Works on any website</span>
        </div>
      </div>
    </section>
  );
};

export default CTA;
