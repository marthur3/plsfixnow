import Image from "next/image";
import config from "@/config";
import WebstoreLink from "./WebstoreLink";

const ExtensionInstall = () => {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-bold text-3xl lg:text-5xl tracking-tight mb-8">
          Get Started in 30 Seconds
        </h2>
        <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
          Install the free Chrome extension and start marking up slides and dashboards immediately. No account required.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Install from Chrome Web Store</h3>
              <p className="text-base-content/70 mb-4">
                One click to add PLSFIX-THX to Chrome. It&apos;s free and takes seconds.
              </p>
              {config.extensionComingSoon ? (
                <span className="btn btn-primary btn-disabled !bg-primary/60">
                  Coming Soon
                </span>
              ) : (
                <WebstoreLink placement="steps" className="btn btn-primary">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4.5" fill="currentColor"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.93 0 3.68.69 5.05 1.83L12 12l-5.05-6.17A7.96 7.96 0 0 1 12 4zm-8 8c0-1.93.69-3.68 1.83-5.05L12 12l-6.17 5.05A7.96 7.96 0 0 1 4 12zm8 8a7.96 7.96 0 0 1-5.05-1.83L12 12l5.05 6.17A7.96 7.96 0 0 1 12 20z" fill="currentColor" opacity="0.7"/>
                  </svg>
                  Add to Chrome — Free
                </WebstoreLink>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Capture Any Slide or Dashboard</h3>
              <p className="text-base-content/70">
                Use Alt+Shift+S for area capture or Alt+Shift+F for full page. Works on PowerPoint, Power BI, Google Slides, and more.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Annotate & Share with Your Team</h3>
              <p className="text-base-content/70">
                Drop numbered pins, export to PNG, and paste into Slack, Teams, or email. Everyone sees exactly what to change.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8">
            <div className="aspect-video bg-base-100 rounded-lg shadow-2xl overflow-hidden">
              <Image
                src="/hero/New Note.jpeg"
                alt="Annotated slide preview"
                width={960}
                height={540}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        <div className="flex flex-wrap justify-center items-center gap-8 text-base-content/60">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Works with PowerPoint & Power BI</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>100% Local Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>Share in Under 10 Seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Always Free Version</span>
          </div>
        </div>
        <div className="mt-10 text-sm text-base-content/60">
          What happens after install: <span className="font-semibold text-base-content">Pin icon → Capture → Annotate → Export</span>
        </div>
      </div>
    </section>
  );
};

export default ExtensionInstall;
