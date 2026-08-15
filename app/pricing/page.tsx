import type { Metadata } from "next";
import Link from "next/link";

import {
  Badge,
  Card,
  PageHeader,
  PageShell,
} from "@/app/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Pricing — Spiritual Oracle",
};

/*
 * NEEDS A DECISION — placeholder figures.
 *
 * PRICE and PERIOD below are invented. The free-tier limit of 3 is the one
 * real number here: it matches MAX_FREE_QUERIES in the API's settings. Confirm
 * the paid price, the billing period, and whether an annual option exists
 * before this page goes live.
 */
const PRICE = "$X";
const PERIOD = "month";
const FREE_QUESTIONS = 3;

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Enough to see whether this speaks to you.",
    cta: { label: "Get started", href: "/signup" },
    highlighted: false,
    features: [
      `${FREE_QUESTIONS} questions in total`,
      "Both texts — Gita and Ramcharitmanas",
      "Original Sanskrit and Awadhi alongside every verse",
      "Published scholarly translations",
    ],
  },
  {
    name: "Unlimited",
    price: PRICE,
    period: `per ${PERIOD}`,
    blurb: "For a daily practice rather than an experiment.",
    cta: { label: "Upgrade", href: "/account" },
    highlighted: true,
    features: [
      "Unlimited questions",
      "Full question history, saved and searchable",
      "Both texts — Gita and Ramcharitmanas",
      "Support for the work of correcting the corpus",
    ],
  },
];

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-1 shrink-0 text-accent"
    >
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="Pricing"
        title="Simple, Honest Pricing"
        lead="Start free. Upgrade only if you find yourself coming back."
        align="center"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {TIERS.map((tier) => (
          <Card key={tier.name} highlighted={tier.highlighted}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-light text-primary">
                {tier.name}
              </h2>
              {tier.highlighted && <Badge tone="accent">Recommended</Badge>}
            </div>

            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl font-light text-primary sm:text-5xl">
                {tier.price}
              </span>
              <span className="text-sm text-muted">{tier.period}</span>
            </p>

            <p className="mt-3 text-sm leading-6 text-secondary">
              {tier.blurb}
            </p>

            <ul className="mt-6 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-3 text-sm leading-6 text-secondary">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.cta.href}
              className={
                tier.highlighted
                  ? "mt-8 flex h-11 items-center justify-center rounded-full bg-accent text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
                  : "mt-8 flex h-11 items-center justify-center rounded-full border border-line-strong text-sm text-accent transition-colors hover:bg-surface-2"
              }
            >
              {tier.cta.label}
            </Link>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-6 text-muted">
        Pricing is not final and billing is not yet connected. Nothing on this
        page will charge you today.
      </p>
    </PageShell>
  );
}
