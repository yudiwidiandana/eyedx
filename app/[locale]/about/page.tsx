import { notFound } from "next/navigation";
import { AboutPageContent } from "../../about/page";
import { locales, type Locale } from "../../lib/translations";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleAboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <AboutPageContent locale={locale as Locale} />;
}
