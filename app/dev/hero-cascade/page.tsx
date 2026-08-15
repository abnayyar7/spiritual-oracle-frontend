import type { Metadata } from "next";

import HeroCascade from "@/app/components/hero-cascade";

/*
 * Isolated preview for the Number Cascade backdrop — no hero copy, no CTA, just
 * the visual at full bleed so it can be judged on its own. Delete this route
 * once the component is integrated into the real landing page.
 */

export const metadata: Metadata = {
  title: "Hero Cascade — preview",
  robots: { index: false, follow: false },
};

export default function HeroCascadePreview() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <HeroCascade />
    </main>
  );
}
