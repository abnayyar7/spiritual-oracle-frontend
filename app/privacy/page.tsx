import type { Metadata } from "next";
import Link from "next/link";

import {
  PageHeader,
  PageShell,
  Section,
} from "@/app/components/ui/page-shell";

/*
 * ⚠️ STRUCTURAL PLACEHOLDER — NOT LEGAL ADVICE.
 *
 * This describes what the app actually does today (Supabase auth and storage,
 * Google Gemini for reflections, questions retained per account) so the
 * structure is right and the disclosures are honest. It has NOT been reviewed
 * by a lawyer.
 *
 * Before launch this must be reviewed by qualified counsel and completed with:
 *   - the legal entity name and registered address
 *   - governing jurisdiction, and whether GDPR / UK GDPR / CCPA apply
 *   - a concrete data-retention period (currently unspecified below)
 *   - a data-protection contact, and a DPO if one is required
 *   - cookie disclosure if analytics are ever added
 */

export const metadata: Metadata = {
  title: "Privacy Policy — Spiritual Oracle",
  robots: { index: false, follow: true },
};

const LAST_UPDATED = "15 August 2026";
const SUPPORT_EMAIL = "hello@spiritualoracle.app";

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow={`Last updated ${LAST_UPDATED}`}
        title="Privacy Policy"
        lead="What we collect, why, and who else touches it."
      />

      <div className="mb-10 rounded-xl border border-line-strong bg-surface-2 px-5 py-4 text-sm leading-6 text-caution">
        This policy is a working draft pending legal review. It describes our
        current practices accurately but is not yet a finalised legal document.
      </div>

      <Section title="What we collect">
        <p>
          <strong>Account details.</strong> Your email address and an encrypted
          password, handled by our authentication provider. We never see your
          password in readable form.
        </p>
        <p>
          <strong>What you ask.</strong> The question text you submit, the
          number you choose, the verse it selected, and the reflection generated
          in response. These are stored against your account so your history is
          available to you.
        </p>
        <p>
          <strong>Subscription state.</strong> Your plan, how many questions you
          have used in the current period, and — if you subscribe — a customer
          reference from our payment processor. Card details never reach our
          servers.
        </p>
        <p>
          <strong>Basic technical data.</strong> Ordinary server logs such as IP
          address and browser type, kept for security and debugging.
        </p>
      </Section>

      <Section title="How we use it">
        <p>
          To operate the service: authenticate you, select and return a verse,
          generate a reflection, show your history, and enforce plan limits.
        </p>
        <p>
          To improve the corpus. We review translation quality in aggregate. If
          a verse is frequently associated with reports of a problem, we look at
          the underlying text.
        </p>
        <p>
          We do not sell your data. We do not use the content of your questions
          for advertising, and we do not use it to train AI models.
        </p>
      </Section>

      <Section title="Third-party services">
        <p>
          <strong>Supabase</strong> provides our database and authentication.
          Your account record, questions and history live there.
        </p>
        <p>
          <strong>Google Gemini</strong> generates reflections. When you ask a
          question, your question text and the selected verse translation are
          sent to Google&apos;s API to produce the response. Your email address
          and account identity are not sent.
        </p>
        <p>
          <strong>Hosting and payments.</strong> Our host processes requests to
          the site. If you subscribe, a payment processor handles the
          transaction and holds the card details.
        </p>
        <p>
          Each of these providers has its own privacy policy governing what they
          do with data they receive.
        </p>
      </Section>

      <Section title="Retention">
        <p>
          Your questions and history are kept while your account is open, so you
          can return to them. Delete your account and we remove the account
          record and its associated question history.
        </p>
        <p className="text-muted">
          A specific retention period for server logs and backups is still to be
          set. This section will be completed before launch.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask for a copy of your data, ask us to correct it, or ask us
          to delete it along with your account. Depending on where you live you
          may also have rights to restrict or object to certain processing, and
          to complain to a data protection authority.
        </p>
        <p>
          To make any of these requests, write to us at the address below.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-accent underline-offset-4 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          , or via the{" "}
          <Link
            href="/contact"
            className="text-accent underline-offset-4 hover:underline"
          >
            contact page
          </Link>
          .
        </p>
      </Section>
    </PageShell>
  );
}
