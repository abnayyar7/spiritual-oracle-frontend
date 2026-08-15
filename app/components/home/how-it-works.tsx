/*
 * Three steps. Numerals are set in the serif and tinted with the accent so
 * they echo the engraved figures on the dial rather than reading as list
 * bullets.
 */

const STEPS = [
  {
    n: "01",
    title: "Choose your text",
    body: "Select the Bhagavad Gita or Ramcharitmanas",
  },
  {
    n: "02",
    title: "Ask & choose a number",
    body: "Share what's on your mind, then pick a number",
  },
  {
    n: "03",
    title: "Receive guidance",
    body: "Get the verse and a personal reflection",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <h2 className="text-center font-display text-3xl font-light text-primary sm:text-4xl">
          How it works
        </h2>

        <ol className="mt-12 grid grid-cols-1 gap-10 sm:mt-16 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((s) => (
            <li key={s.n} className="text-center sm:text-left">
              <span
                aria-hidden="true"
                className="font-display text-3xl font-light tracking-widest text-accent"
              >
                {s.n}
              </span>
              <div className="mt-3 h-px w-10 bg-line-strong mx-auto sm:mx-0" />
              <h3 className="mt-5 font-display text-xl text-primary sm:text-2xl">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-secondary">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
