import { notFound } from "next/navigation";
import { AdminPageContent } from "../../admin/page";
import { locales, type Locale } from "../../lib/translations";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return <AdminPageContent locale={locale as Locale} />;
}
