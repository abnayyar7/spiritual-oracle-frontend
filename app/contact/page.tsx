import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/app/components/ui/page-shell";

import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact — Spiritual Oracle",
};

/* NEEDS A DECISION — placeholder address. Replace with the real inbox. */
const SUPPORT_EMAIL = "hello@spiritualoracle.app";

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Support"
        title="Get in Touch"
        lead="Questions, problems, or a translation that looks wrong — all welcome."
      />

      <ContactForm />

      <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-6 text-center">
        <p className="text-sm text-secondary">
          Prefer email? Write to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-accent underline-offset-4 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p className="mt-3 text-xs leading-5 text-muted">
          If you are reporting a mistranslation, including the kand or chapter
          and the verse number helps us find it quickly.
        </p>
      </div>
    </PageShell>
  );
}
