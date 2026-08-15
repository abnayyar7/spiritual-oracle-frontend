/*
 * Quiet corpus stats. Deliberately understated — hairline rules, generous
 * space, no cards or fills. It should read as a colophon, not a banner.
 */

const STATS = [
  { value: "701", label: "Bhagavad Gita Verses" },
  { value: "1,074", label: "Ramcharitmanas Dohas" },
  { value: "AI-Guided", label: "Personal Reflection" },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-3 sm:gap-6 sm:py-16">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-4xl font-light tracking-wide text-primary sm:text-5xl">
              {s.value}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-secondary sm:text-sm sm:tracking-[0.14em]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
