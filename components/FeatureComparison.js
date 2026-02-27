import config from "@/config";

const FeatureComparison = () => {
  const features = [
    {
      icon: "📸",
      feature: "Unlimited Markups",
      description: "No daily limits — capture and annotate as many slides and dashboards as you need"
    },
    {
      icon: "📌",
      feature: "Numbered Annotations",
      description: "Pin feedback to exact spots. Say \"fix #1\" instead of writing paragraphs"
    },
    {
      icon: "🤖",
      feature: "Copy for AI",
      description: "One click copies your annotated screenshot + prompt — paste straight into ChatGPT, Claude, or Cursor"
    },
    {
      icon: "📄",
      feature: "PDF, PNG & HTML Export",
      description: "Professional exports in every format for formal reviews, Slack, or email"
    },
    {
      icon: "🚫",
      feature: "No Watermarks",
      description: "Clean, professional exports every time — no branding or watermarks"
    },
    {
      icon: "🎨",
      feature: "Full Annotation Toolkit",
      description: "Drawing tools, text labels, arrows, and color options for precise feedback"
    },
    {
      icon: "🔒",
      feature: "100% Private",
      description: "Everything runs locally in your browser — your screenshots never leave your machine"
    },
    {
      icon: "⌨️",
      feature: "Keyboard Shortcuts",
      description: "Alt+Shift+S for area select, Alt+Shift+F for full page, and more power-user shortcuts"
    },
  ];

  return (
    <section className="py-24 px-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="badge badge-primary badge-lg mb-4 font-semibold">All Features Included</span>
        <h2 className="font-bold text-3xl lg:text-5xl tracking-tight mb-6">
          Every Pro Feature. Completely Free.
        </h2>
        <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
          No trials, no paywalls, no sign-up required. Install the extension and get the full toolkit instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((item, index) => (
          <div key={index} className="flex gap-4 p-6 bg-base-100 rounded-xl border border-base-content/10 hover:shadow-lg transition-shadow">
            <span className="text-2xl shrink-0">{item.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{item.feature}</h3>
              <p className="text-sm opacity-70 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        {config.extensionComingSoon ? (
          <span className="btn btn-primary btn-wide btn-disabled">
            Coming Soon
          </span>
        ) : (
          <a
            href="https://chromewebstore.google.com/detail/heijdkcfjjhcbkhikfhgcmnigmceokjj"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-wide btn-lg"
          >
            Install Free Extension
          </a>
        )}
        <p className="text-sm text-base-content/60 mt-4">
          Free forever. No account required.
        </p>
      </div>
    </section>
  );
};

export default FeatureComparison;
