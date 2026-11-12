import { notFound } from "next/navigation";
import { LoginPageContent } from "../../login/page";
import { locales, type Locale } from "../../lib/translations";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <LoginPageContent locale={locale as Locale} />;
}
