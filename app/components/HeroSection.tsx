import Link from "next/link";
import Image from "next/image";
import { translations, type Locale } from "../lib/translations";
import { Button } from "@/components/ui/button";

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

        <p className="mx-auto mb-10 max-w-2xl rounded-lg bg-black/25 px-5 py-3 text-lg leading-relaxed text-white/95 shadow-md backdrop-blur-sm sm:text-xl">
          {t.description}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            nativeButton={false}
            className="h-11 w-full px-8 text-base shadow-lg sm:w-auto"
            render={
              <Link href={`/${locale === "en" ? "diagnosis" : `${locale}/diagnosis`}`} />
            }
          >
            {t.ctaPrimary}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            nativeButton={false}
            className="h-11 w-full px-8 text-base shadow-lg sm:w-auto"
            render={
              <Link href={`/${locale === "en" ? "about" : `${locale}/about`}`} />
            }
          >
            {t.ctaSecondary}
          </Button>
        </div>
      </div>
    </section>
  );
}
