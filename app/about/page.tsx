"use client";

import { useState } from "react";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";

export function AboutPageContent({ locale }: { locale: Locale }) {
  const t = translations[locale].aboutPage;
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="flex pt-8 min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold text-zinc-900">{t.title}</h1>
          <div className="prose prose-zinc max-w-none">
            <p className="mb-4 text-lg text-zinc-600">{t.intro1}</p>
            <p className="mb-4 text-lg text-zinc-600">{t.intro2}</p>
            <h2 className="mt-8 mb-2 text-2xl font-bold text-zinc-900">{t.heading}</h2>
            <ul className="space-y-1 text-lg text-zinc-600">
              {t.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <h3 className="mt-8 mb-2 text-2xl font-semibold text-zinc-900">{t.validationTitle}</h3>
            <p className="text-lg text-zinc-600">{t.validationText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                {t.privacyButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                {t.termsButtonLabel}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showPrivacy ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <h3 className="mb-4 text-2xl font-semibold text-zinc-900">{t.privacyButtonLabel}</h3>
            <p className="mb-6 text-lg leading-8 text-zinc-600">{t.privacyNoticeText}</p>
            <button
              type="button"
              onClick={() => setShowPrivacy(false)}
              className="inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              {t.closeButtonLabel}
            </button>
          </div>
        </div>
      ) : null}

      {showTerms ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <h3 className="mb-4 text-2xl font-semibold text-zinc-900">{t.termsButtonLabel}</h3>
            <p className="mb-6 text-lg leading-8 text-zinc-600">{t.termsNoticeText}</p>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              {t.closeButtonLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AboutPage() {
  return <AboutPageContent locale="en" />;
}
