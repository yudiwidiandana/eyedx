import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8 lg:px-12">
      <section className="grid w-full max-w-6xl items-center gap-10 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2 md:p-12">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            New product launch
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Build smarter experiences with confidence.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              A clean, modern landing page starter for your next idea, product, or startup.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#"
              className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get started
            </a>
            <a
              href="#"
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"
            >
              Learn more
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Image
            src="/landing-hero.svg"
            alt="Landing page hero illustration"
            width={640}
            height={480}
            className="w-full max-w-md rounded-2xl object-cover"
            priority
          />
        </div>
      </section>
    </main>
  );
}
