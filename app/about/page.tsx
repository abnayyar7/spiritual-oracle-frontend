import type { Metadata } from "next";
import Link from "next/link";

import {
  PageHeader,
  PageShell,
  Section,
} from "@/app/components/ui/page-shell";

export const metadata: Metadata = {
  title: "About — Spiritual Oracle",
  description:
    "A bibliomancy-inspired guide drawing on the Bhagavad Gita and the Ramcharitmanas.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Our story"
        title="About Spiritual Oracle"
        lead="An old practice in a new form: bring a question, choose a number, and receive a verse — with a reflection that helps you sit with it."
      />

      <Section title="What this is">
        <p>
          Spiritual Oracle is built on <em>bibliomancy</em> — the very old habit
          of opening a sacred book at an unplanned place and reading what you
          find there as counsel. People have done this with the Gita, the I
          Ching, the Psalms and the Divan of Hafez for centuries.
        </p>
        <p>
          The mechanism here is deliberately simple. You write down what is
          actually on your mind, you choose a number, and that number selects a
          verse. Nothing about your question influences which verse you get.
          What follows is a short reflection that connects the verse you drew to
          the question you brought.
        </p>
      </Section>

      <Section title="Why two texts">
        <p>
          The <strong>Bhagavad Gita</strong> is 701 verses of a conversation
          held on a battlefield, at the moment someone has to act and does not
          want to. It is direct, and it is mostly about duty, attachment and
          the fear of consequences.
        </p>
        <p>
          The <strong>Ramcharitmanas</strong>, Tulsidas&apos;s sixteenth-century
          retelling of the Ramayana in Awadhi, runs to 1,074 dohas across seven
          kands. It is a narrative rather than an argument — exile, loyalty,
          loss, return — and it tends to speak to endurance and relationship
          where the Gita speaks to decision.
        </p>
        <p>
          Two different registers, and you choose which one you want to hear
          from.
        </p>
      </Section>

      <Section title="Our commitment to accuracy">
        <p>
          Translations come from published, public-domain scholarly sources —
          Swami Sivananda and others for the Gita, F.S. Growse for the
          Ramcharitmanas — rather than being generated for this app. The
          original Sanskrit and Awadhi are shown alongside so you can always see
          what is being translated.
        </p>
        <p>
          We audit that text for quality and take rows out of circulation when
          they fail: passages too damaged by optical character recognition to
          read, and passages we cannot confidently match to the right verse.
          Where no reliable English translation exists yet, we say so rather
          than substitute a machine translation.
        </p>
        <p>
          We do not claim the corpus is perfect. Scanned and re-typeset
          nineteenth and twentieth century texts carry errors, and some remain.
          If you find one, please{" "}
          <Link
            href="/contact"
            className="text-accent underline-offset-4 hover:underline"
          >
            tell us
          </Link>{" "}
          — corrections are welcome and acted on.
        </p>
      </Section>

      <Section title="The technology">
        <p>
          The verse you receive is chosen by your number alone. No model picks
          it, and no model rewrites it.
        </p>
        <p>
          What AI does here is narrower: after the verse is drawn, a language
          model reads your question alongside the existing translation and
          writes a few sentences connecting the two. It is working from the
          published translation, not producing its own, and it is asked to be
          warm and plain rather than scholarly.
        </p>
        <p>
          A reflection is a prompt for your own thinking. It is not religious
          authority, and it is not a substitute for a teacher, a doctor or a
          lawyer.
        </p>
      </Section>

      <div className="mt-14 border-t border-line pt-10 text-center">
        <p className="text-secondary">Ready to ask something?</p>
        <Link
          href="/oracle"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
        >
          Ask a question
        </Link>
      </div>
    </PageShell>
  );
}
