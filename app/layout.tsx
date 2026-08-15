import type { Metadata } from "next";

import Header from "@/app/components/header";
import { serif } from "@/app/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spiritual Oracle",
  description: "Ask a question and receive a Bhagavad Gita reflection.",
};

/*
 * Applies a stored theme before the page paints. Without this the markup ships
 * as dark (the default below), and a user who chose light would see a dark
 * flash while React hydrates and the toggle catches up.
 *
 * Kept deliberately tiny and inlined — a separate file would be a network
 * round trip, which is the very thing that causes the flash.
 */
const noFlashScript = `
(function () {
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`h-full antialiased ${serif.variable}`}
    >
      <body className="min-h-full flex flex-col bg-surface text-primary">
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <Header />
        {children}
      </body>
    </html>
  );
}
