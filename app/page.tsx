import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
          Bhagavad Gita Oracle
        </p>
        <h1 className="text-4xl font-semibold text-stone-950 sm:text-5xl">
          Ask with intention. Receive a verse-led reflection.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-stone-600">
          Spiritual Oracle pairs your question and oracle number with a passage
          from the Bhagavad Gita, then offers a concise AI-generated takeaway.
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex h-11 items-center justify-center rounded-md bg-stone-950 px-6 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}
