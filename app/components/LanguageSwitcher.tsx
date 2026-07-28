"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { locales, type Locale, translations } from "../lib/translations";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }

    const segments = pathname.split("/").filter(Boolean);
    const [currentLocale, ...rest] = segments;

    const nextPath =
      currentLocale && locales.includes(currentLocale as Locale)
        ? `/${[nextLocale, ...rest].join("/")}`
        : `/${[nextLocale, ...segments].join("/")}`;

    router.push(nextPath);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:text-zinc-900"
        aria-label={translations[locale].language.switcherHint}
      >
        <span>{translations[locale].language.label}</span>
        <span className="text-zinc-500">{locale === "en" ? "EN" : "ID"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
          {locales.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChange(option)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                locale === option
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <span>{option === "en" ? "English" : "Bahasa Indonesia"}</span>
              <span>{option === "en" ? "EN" : "ID"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
