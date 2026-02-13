import config from "@/config";

const FeatureComparison = () => {
  const features = [
    {
      feature: "Daily Markups",
      free: "5 per day",
      premium: "Unlimited",
      description: "Capture and annotate slides and dashboards"
    },
    {
      feature: "Numbered Annotations",
      free: true,
      premium: true,
      description: "Pin feedback to exact spots on any visual"
    },
    {
      feature: "Chrome Extension",
      free: true,
      premium: true,
      description: "Works with PowerPoint Online, Power BI, Google Slides, and more"
    },
    {
      feature: "PNG Export",
      free: true,
      premium: true,
      description: "Export annotated visuals as high-quality PNG files"
    },
    {
      feature: "Watermarks",
      free: "Yes",
      premium: "None",
      description: "Free exports include a small watermark"
    },
    {
      feature: "PDF Export",
      free: false,
      premium: true,
      description: "Professional PDF documents for formal review cycles"
    },
    {
      feature: "HTML Export",
      free: false,
      premium: true,
      description: "Shareable web format for archiving feedback"
    },
    {
      feature: "All Annotation Tools",
      free: false,
      premium: true,
      description: "Advanced markup tools and formatting options"
    },
    {
      feature: "Priority Support",
      free: false,
      premium: true,
      description: "Get help faster with premium customer support"
    },
    {
      feature: "Lifetime Updates",
      free: false,
      premium: true,
      description: "All future feature updates included"
    }
  ];

  return (
    <section className="py-24 px-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-bold text-3xl lg:text-5xl tracking-tight mb-8">
          Start Free, Upgrade When You Need More
        </h2>
        <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
          The free version handles your daily slide reviews. Go Pro when your team needs unlimited markups and watermark-free exports.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-lg w-full">
          <thead>
            <tr>
              <th className="text-left">Feature</th>
              <th className="text-center">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">Free</span>
                  <span className="text-sm opacity-60">$0</span>
                </div>
              </th>
              <th className="text-center">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">Lifetime Pro</span>
                  <span className="text-sm opacity-60">$39 one-time</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((item, index) => (
              <tr key={index} className="hover:bg-base-200/50">
                <td>
                  <div>
                    <div className="font-semibold">{item.feature}</div>
                    <div className="text-sm opacity-60 mt-1">{item.description}</div>
                  </div>
                </td>
                <td className="text-center">
                  {typeof item.free === 'string' ? (
                    <span className="font-medium text-sm">{item.free}</span>
                  ) : item.free ? (
                    <svg className="w-6 h-6 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-base-content/30 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </td>
                <td className="text-center">
                  {typeof item.premium === 'string' ? (
                    <span className="font-medium text-sm">{item.premium}</span>
                  ) : item.premium ? (
                    <svg className="w-6 h-6 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-base-content/30 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-12">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          {config.extensionComingSoon ? (
            <span className="btn btn-outline btn-wide btn-disabled">
              Coming Soon
            </span>
          ) : (
            <a
              href="https://chrome.google.com/webstore/detail/plsfix-thx"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-wide"
            >
              Start Free
            </a>
          )}
          <a
            href="#pricing"
            className="btn btn-primary btn-wide"
          >
            Get Lifetime Pro
          </a>
        </div>
        <p className="text-sm text-base-content/60 mt-4">
          No credit card required • One-time payment • Lifetime access
        </p>
      </div>
    </section>
  );
};

export default FeatureComparison;
