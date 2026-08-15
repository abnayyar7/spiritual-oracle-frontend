import { Cormorant_Garamond } from "next/font/google";

/*
 * App-wide serif. Hoisted out of HeroDial so the header wordmark and any
 * future headings share one font instance rather than each triggering its own
 * next/font call.
 *
 * The CSS variable is deliberately NOT named --font-serif: Tailwind's own
 * theme already defines that key, both would land on :root, and whichever the
 * bundler emitted last would silently win.
 *
 * Applied to <html> in layout.tsx; consume it as the `font-display` utility or
 * via var(--font-cormorant).
 */
export const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal"],
  display: "swap",
  variable: "--font-cormorant",
});
