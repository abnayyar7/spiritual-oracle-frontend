import Footer from "@/app/components/footer";
import HeroDial from "@/app/components/hero-dial";
import HowItWorks from "@/app/components/home/how-it-works";
import SampleExperience from "@/app/components/home/sample-experience";
import TrustStrip from "@/app/components/home/trust-strip";
import { getSessionUser } from "@/lib/auth";

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

  return (
    <>
      <main>
        <section className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
          <HeroDial ctaHref={user ? "/oracle" : "/login"} />
        </section>

        <TrustStrip />
        <HowItWorks />
        <SampleExperience />
      </main>

      <Footer />
    </>
  );
}
