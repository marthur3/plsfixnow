const PrivacySecurity = () => {
  return (
    <section className="bg-base-100">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="max-w-3xl">
          <p className="uppercase tracking-widest text-xs text-base-content/50 mb-3">
            Privacy & Security
          </p>
          <h2 className="font-bold text-3xl md:text-4xl tracking-tight mb-6">
            Your screenshots never leave your browser
          </h2>
          <p className="text-lg text-base-content/70 mb-8">
            PLSFIX-THX processes everything locally in Chrome. No uploads, no servers, no waiting on IT approvals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 bg-base-200 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold">100% local</span>
              <span className="text-sm text-base-content/60">Images stay on your machine</span>
            </div>
            <div className="flex items-center gap-3 bg-base-200 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold">No uploads</span>
              <span className="text-sm text-base-content/60">Nothing stored on servers</span>
            </div>
            <div className="flex items-center gap-3 bg-base-200 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold">Instant</span>
              <span className="text-sm text-base-content/60">Capture → annotate → export</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySecurity;
