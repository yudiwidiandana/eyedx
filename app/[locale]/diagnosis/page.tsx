import { notFound } from "next/navigation";
import { DiagnosisPageContent } from "../../diagnosis/page";
import { locales, type Locale } from "../../lib/translations";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleDiagnosisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <DiagnosisPageContent locale={locale as Locale} />;
}
