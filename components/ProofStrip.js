import config from "@/config";

const formatCount = (value) => {
  if (!value) return null;
  return new Intl.NumberFormat("en-US").format(value);
};

const ProofStrip = () => {
  const proof = config.webstore?.socialProof || {};
  const hasAnyProof =
    Boolean(proof.rating) ||
    Boolean(proof.reviewCount) ||
    Boolean(proof.userCount) ||
    (proof.testimonials && proof.testimonials.length > 0);

  if (!hasAnyProof) return null;

  return (
    <section className="bg-base-200">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-sm text-base-content/70">
            <span className="uppercase tracking-widest text-xs text-base-content/50">
              Chrome Web Store
            </span>
            {proof.rating && (
              <span className="flex items-center gap-2">
                <span className="font-semibold text-base-content">{proof.rating.toFixed(1)}★</span>
                {proof.reviewCount && (
                  <span>{formatCount(proof.reviewCount)} reviews</span>
                )}
              </span>
            )}
            {proof.userCount && (
              <span>{formatCount(proof.userCount)} users</span>
            )}
          </div>
          {proof.testimonials && proof.testimonials.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 text-sm">
              {proof.testimonials.slice(0, 2).map((t, i) => (
                <div key={i} className="bg-base-100 rounded-xl px-4 py-3 shadow-sm">
                  <p className="text-base-content/80">“{t.quote}”</p>
                  <p className="mt-2 text-xs text-base-content/50">{t.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProofStrip;
