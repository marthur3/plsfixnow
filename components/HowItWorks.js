import config from "@/config";
import WebstoreLink from "./WebstoreLink";

const steps = [
  {
    number: "1",
    title: "Capture",
    description: "Click the extension icon or press Alt+Shift+S. Select any area on your screen.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Annotate",
    description: "Click anywhere to drop numbered pins. Add a note to each one. Drag to reposition.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Share",
    description: "Export as PNG and paste into ChatGPT, Claude, Slack, or email. Your AI sees exactly what you mean.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-base-100 py-20 px-8" id="how-it-works">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight mb-4">
            Three steps. Ten seconds.
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            From screen to actionable feedback, faster than typing a description.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center p-8 rounded-2xl bg-base-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-content mb-6">
                {step.icon}
              </div>
              <h3 className="font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-base-content/70 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          {config.extensionComingSoon ? (
            <span className="btn btn-primary btn-lg btn-wide btn-disabled !bg-primary/60">
              Coming Soon
            </span>
          ) : (
            <WebstoreLink placement="how_it_works" className="btn btn-primary btn-lg btn-wide text-lg">
              Add to Chrome — It&apos;s Free
            </WebstoreLink>
          )}
          <p className="text-sm text-base-content/50 mt-4">No account required. Works on any website.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
