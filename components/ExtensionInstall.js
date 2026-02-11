import Image from "next/image";

const ExtensionInstall = () => {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-bold text-3xl lg:text-5xl tracking-tight mb-8">
          Get Started in 30 Seconds
        </h2>
        <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
          Install the free Chrome extension and start marking up slides and dashboards immediately.
          No account required to get started.
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
                Click the button below to add PLSFIX-THX to your Chrome browser.
                It&apos;s free and takes just one click.
              </p>
              <a
                href="https://chrome.google.com/webstore/detail/plsfix-thx"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 3.616-2.001 5.06-.686-.395-1.457-.623-2.286-.623a5.007 5.007 0 0 0-2.228.527A6.985 6.985 0 0 1 12 5.163c1.377 0 2.666.402 3.751 1.099l1.817-1.817zm-8.569 9.96A6.965 6.965 0 0 1 5.163 12c0-1.377.402-2.666 1.099-3.751l1.817 1.817c-1.105 1.444-1.832 3.202-2.001 5.06a5.007 5.007 0 0 0 2.286.623c.789 0 1.52-.228 2.228-.527zM12 18.837a6.965 6.965 0 0 1-6.837-3.836 5.007 5.007 0 0 0 .623-2.286c0-.789-.228-1.52-.527-2.228A6.985 6.985 0 0 1 12 5.163v13.674z"/>
                </svg>
                Add to Chrome - Free
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Capture Any Slide or Dashboard</h3>
              <p className="text-base-content/70">
                Use keyboard shortcuts (Alt+Shift+S for area selection, Alt+Shift+F for full page)
                or click the extension icon to capture any PowerPoint slide, Power BI report, or web-based presentation.
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
                Add numbered annotations pointing to exact elements — a misaligned chart, a wrong color, a missing data label. Export to PNG and share via email, Slack, or Teams. Everyone sees exactly what you mean.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8">
            {/* TODO: Replace with actual product screenshot/video showing a PowerPoint slide being annotated */}
            <div className="aspect-video bg-base-100 rounded-lg shadow-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-base-content/60">Extension Demo Video</p>
                <p className="text-sm text-base-content/40 mt-2">Coming Soon</p>
              </div>
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
      </div>
    </section>
  );
};

export default ExtensionInstall;
