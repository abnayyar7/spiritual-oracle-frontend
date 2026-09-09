import Footer from "@/app/components/footer";
import HeroDial from "@/app/components/hero-dial";
import HowItWorks from "@/app/components/home/how-it-works";
import TrustStrip from "@/app/components/home/trust-strip";
import { QOTDCard } from "@/app/components/qotd-card";
import { getSessionUser } from "@/lib/auth";
import { getTodayQOTD } from "@/lib/qotd";

/*
 * Homepage. The hero is HeroDial exactly as previewed at /dev/hero-dial —
 * same placeholder copy, no overrides — with the CTA pointed at the right
 * route for the current session.
 *
 * overflow-hidden is scoped to the hero section rather than the page: on the
 * page it would clip everything below it and kill scrolling. Height subtracts
 * the 4rem header so the dial fills exactly one viewport.
 */

export default async function Home() {
  const user = await getSessionUser();
  const qotd = await getTodayQOTD();

  return (
    <>
      <main>
        <section className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
          <HeroDial ctaHref={user ? "/oracle" : "/login"} />
        </section>

        <TrustStrip />

        {/* Quote of the Day Section */}
        {qotd && (
          <section className="w-full bg-surface px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <h2 className="font-display text-3xl font-light tracking-wide text-primary mb-12 text-center sm:text-4xl">
                Verse of the Day
              </h2>
              <QOTDCard
                date={qotd.date}
                original_text={qotd.original_text}
                reflection_text={qotd.reflection_text}
              />
            </div>
          </section>
        )}

        <HowItWorks />
      </main>

      <Footer />
    </>
  );
}
