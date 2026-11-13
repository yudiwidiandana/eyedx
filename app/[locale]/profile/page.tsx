import { notFound } from "next/navigation";
import { ProfilePageContent } from "../../profile/page";
import { locales, type Locale } from "../../lib/translations";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <ProfilePageContent locale={locale as Locale} />;
}
