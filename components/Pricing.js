import config from "@/config";

const Pricing = () => {
  return (
    <section className="bg-base-200 overflow-hidden" id="pricing">
      <div className="py-24 px-8 max-w-3xl mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <p className="font-medium text-primary mb-4">Pricing</p>
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight mb-4">
            100% Free. No Catch.
          </h2>
          <p className="text-lg opacity-80 max-w-xl mx-auto">
            We believe great feedback tools should be accessible to everyone. Every feature is unlocked from day one.
          </p>
        </div>

        <div className="relative w-full max-w-lg mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <span className="badge text-xs text-primary-content font-semibold border-0 bg-primary">
              ALL FEATURES INCLUDED
            </span>
          </div>

          <div className="absolute -inset-[1px] rounded-[9px] bg-primary z-10"></div>

          <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg">
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-lg lg:text-xl font-bold">PLSFIX-THX</p>
                <p className="text-base-content/80 mt-2">
                  The full professional toolkit — no limits, no watermarks
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-baseline">
              <p className="text-5xl tracking-tight font-extrabold">Free</p>
              <p className="text-base-content/60 text-sm font-medium">forever</p>
            </div>
            <ul className="space-y-2.5 leading-relaxed text-base flex-1">
              {[
                "Unlimited markups",
                "All annotation tools",
                "No watermarks",
                "PDF, PNG & HTML export",
                "Copy for AI",
                "Keyboard shortcuts",
                "100% private — runs locally",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-[18px] h-[18px] text-success shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              {config.extensionComingSoon ? (
                <span className="btn btn-primary btn-block btn-disabled">
                  Coming Soon
                </span>
              ) : (
                <a
                  href="https://chromewebstore.google.com/detail/heijdkcfjjhcbkhikfhgcmnigmceokjj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block"
                >
                  Install Extension — It&apos;s Free
                </a>
              )}
              <p className="flex items-center justify-center gap-2 text-sm text-center text-base-content/80 font-medium">
                No account required. No credit card. Just install and go.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
