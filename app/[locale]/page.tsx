import { notFound } from "next/navigation";
import { HomePage } from "../page";
import { locales, type Locale } from "../lib/translations";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <HomePage locale={locale as Locale} />;
}
