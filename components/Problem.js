const Problem = () => {
  return (
    <section className="bg-neutral text-neutral-content">
      <div className="max-w-5xl mx-auto px-8 py-16 md:py-24 text-center">
        <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6">
          &quot;See the button? No, the other one. Below the header. On the left.&quot;
        </h2>
        <p className="max-w-2xl mx-auto text-lg opacity-90 leading-relaxed mb-12">
          Every vague description costs a follow-up. Every follow-up costs 10 minutes. Numbered annotations eliminate the guesswork so your team (or AI) fixes it the first time.
        </p>

        <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl font-black text-error/80">5x</span>
            <p className="text-sm opacity-70">fewer follow-up messages when using visual annotations vs. text descriptions</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl font-black text-warning/80">&lt;10s</span>
            <p className="text-sm opacity-70">from screenshot to shareable annotated image</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl font-black text-success/80">0</span>
            <p className="text-sm opacity-70">data uploaded — everything stays in your browser</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
