import { notFound } from "next/navigation";
import { RegisterPageContent } from "../../../login/register/page";
import { locales, type Locale } from "../../../lib/translations";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <RegisterPageContent locale={locale as Locale} />;
}
