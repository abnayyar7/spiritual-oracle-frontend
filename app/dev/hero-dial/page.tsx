import type { Metadata } from "next";

import HeroDial from "@/app/components/hero-dial";
import ThemeToggle from "@/app/components/theme-toggle";

/*
 * Isolated preview for the Celestial Dial hero. Sibling of /dev/hero-cascade,
 * which previews the earlier Number Cascade concept.
 *
 * ?theme=light / ?theme=dark pins this page's theme locally, which is how the
 * two modes get captured for comparison without clicking. With no param the
 * dial follows <html>, so the toggle drives it.
 */

export const metadata: Metadata = {
  title: "Hero Dial — preview",
  robots: { index: false, follow: false },
};

export default function HeroDialPreview({
  searchParams,
}: {
  searchParams: { theme?: string };
}) {
  const pinned =
    searchParams.theme === "light" || searchParams.theme === "dark"
      ? searchParams.theme
      : undefined;

  return (
    <main
      data-theme={pinned}
      className="relative h-dvh w-full overflow-hidden"
    >
      <HeroDial />
      {/* Hidden when pinned: the toggle drives <html>, which a locally pinned
          wrapper overrides, so it would report a theme the page is not in. */}
      {!pinned && (
        <div className="absolute right-5 top-5 z-10">
          <ThemeToggle />
        </div>
      )}
    </main>
  );
}
