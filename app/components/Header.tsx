"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { translations, type Locale } from "../lib/translations";

export default function Header({ locale }: { locale: Locale }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = translations[locale].nav;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <nav className="container mx-auto px-6 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/${locale === "en" ? "" : locale}`} className="text-xl font-bold text-zinc-900">
            EyeDx
          </Link>

          <div className="flex items-center gap-3">
            <ul className="hidden items-center gap-8 md:flex">
              <li>
                <Link
                  href={`/${locale === "en" ? "" : locale}`}
                  className="font-medium text-zinc-700 transition-colors hover:text-zinc-900"
                >
                  {t.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale === "en" ? "diagnosis" : `${locale}/diagnosis`}`}
                  className="font-medium text-zinc-700 transition-colors hover:text-zinc-900"
                >
                  {t.diagnosis}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale === "en" ? "about" : `${locale}/about`}`}
                  className="font-medium text-zinc-700 transition-colors hover:text-zinc-900"
                >
                  {t.about}
                </Link>
              </li>
            </ul>

            <LanguageSwitcher locale={locale} />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-zinc-700 md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <ul className="mt-4 space-y-4 border-t border-zinc-200 pt-4 md:hidden">
            <li>
              <Link
                href={`/${locale === "en" ? "" : locale}`}
                onClick={() => setIsMenuOpen(false)}
                className="block font-medium text-zinc-700 transition-colors hover:text-zinc-900"
              >
                {t.home}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale === "en" ? "diagnosis" : `${locale}/diagnosis`}`}
                onClick={() => setIsMenuOpen(false)}
                className="block font-medium text-zinc-700 transition-colors hover:text-zinc-900"
              >
                {t.diagnosis}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale === "en" ? "about" : `${locale}/about`}`}
                onClick={() => setIsMenuOpen(false)}
                className="block font-medium text-zinc-700 transition-colors hover:text-zinc-900"
              >
                {t.about}
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
