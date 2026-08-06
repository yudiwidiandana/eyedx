import { notFound } from "next/navigation";
import { ResultsPageContent } from "../../results/page";
import { locales, type Locale } from "../../lib/translations";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <ResultsPageContent locale={locale as Locale} />;
}
