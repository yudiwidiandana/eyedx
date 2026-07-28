import Link from "next/link";
import Image from "next/image";
import { translations, type Locale } from "../lib/translations";

export default function HeroSection({ locale }: { locale: Locale }) {
  const t = translations[locale].hero;

  return (
    <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 sm:px-8 lg:px-12">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero/Background.jpg"
          alt="Hero Background"
          fill
          className="object-cover object-[center_70%]"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
          {t.title}
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-md sm:text-xl">
          {t.description}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={`/${locale === "en" ? "diagnosis" : `${locale}/diagnosis`}`}
            className="w-full rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 sm:w-auto"
          >
            {t.ctaPrimary}
          </Link>
          <Link
            href={`/${locale === "en" ? "about" : `${locale}/about`}`}
            className="w-full rounded-lg border-2 border-white bg-white px-8 py-4 font-semibold text-zinc-900 shadow-lg transition-colors hover:border-zinc-200 hover:bg-zinc-50 sm:w-auto"
          >
            {t.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
