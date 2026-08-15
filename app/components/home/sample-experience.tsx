/*
 * Static preview of a result.
 *
 * PROVENANCE — the verse and translation below are not invented. They were
 * read out of the live database on 2026-08-15 and are exactly what the running
 * system would serve for this entry:
 *
 *   entries.id            795   (source_id 2, bhagavad_gita, global_index 94)
 *   chapter/verse         2.47
 *   translations.type     'translation'   (active; not commentary, not gated)
 *   translations.author   'Swami Sivananda'
 *
 * Swami Sivananda is the first entry in TRANSLATION_PREFERENCES['bhagavad_gita']
 * in the API's select_translation(), so this is the translation a real request
 * for 2.47 returns today.
 *
 * Held as constants rather than fetched at request time on purpose: this is a
 * fixed marketing sample, and the landing page should not fall over when the
 * database is unreachable — which it was, twice, during development. If the
 * translation is ever re-sourced, update it here.
 *
 * The reflection is hand-written, NOT model output. It follows the same rules
 * as build_system_instruction() in app/routers/oracle.py: warm second-person
 * counsel, 3-4 sentences, no lists, no citing other verses or chapters by
 * number. Labelled "Sample" in the UI so it cannot be mistaken for a live
 * answer.
 */

const SAMPLE = {
  question: "I've worked on something for months and still don't know if it will come to anything.",
  reference: "Bhagavad Gita 2.47",
  translator: "trans. Swami Sivananda",
  sanskrit: [
    "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।",
    "मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
  ],
  // Stored text carries a leading "2.47 " citation; shown as the reference line instead.
  translation:
    "Thy right is to work only, but never with its fruits; let not the fruits of action be thy motive, nor let thy attachment be to inaction.",
  reflection:
    "You have given months of yourself to this, and the not-knowing has become its own weight to carry. What you are being shown is that your claim was always on the work itself and never on how it lands — and that this is a release, not a loss. Give it everything you have, and let the outcome belong to something larger than you. The day you stop bargaining with the result is the day you can begin again without dread.",
};

export default function SampleExperience() {
  return (
    <section className="border-t border-line bg-surface-2">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <h2 className="text-center font-display text-3xl font-light text-primary sm:text-4xl">
          What you receive
        </h2>

        <article className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm sm:mt-12">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-3 sm:px-8">
            <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-accent">
              Sample
            </span>
            <span className="text-xs text-muted">
              {SAMPLE.reference} &middot; {SAMPLE.translator}
            </span>
          </header>

          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Your question
            </p>
            <p className="mt-2 text-base italic leading-7 text-secondary">
              &ldquo;{SAMPLE.question}&rdquo;
            </p>

            <div className="mt-8 border-t border-line pt-7">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                The verse
              </p>
              <p
                lang="sa"
                className="mt-3 font-deva text-base leading-[2.1] text-primary sm:text-xl"
              >
                {/* text-balance stops the closing danda orphaning onto a line
                    of its own once the Devanagari wraps on narrow screens. */}
                {SAMPLE.sanskrit.map((line) => (
                  <span key={line} className="block text-balance">
                    {line}
                  </span>
                ))}
              </p>
              <p className="mt-4 leading-7 text-secondary">
                {SAMPLE.translation}
              </p>
            </div>

            <div className="mt-8 border-t border-line pt-7">
              <p className="text-xs uppercase tracking-[0.18em] text-accent">
                Reflection
              </p>
              <p className="mt-3 leading-7 text-primary">{SAMPLE.reflection}</p>
            </div>
          </div>
        </article>

        <p className="mt-5 text-center text-xs text-muted">
          An illustration of a typical response. Your verse is drawn from the
          number you choose.
        </p>
      </div>
    </section>
  );
}
