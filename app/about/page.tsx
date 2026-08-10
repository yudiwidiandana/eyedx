import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";

export function AboutPageContent({ locale }: { locale: Locale }) {
  const t = translations[locale].aboutPage;

  return (
    <div className="flex pt-8 min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900">{t.title}</h1>
          <div className="prose prose-zinc max-w-none">
            <p className="mb-4 text-lg text-zinc-600">{t.intro1}</p>
            <p className="mb-4 text-lg text-zinc-600">{t.intro2}</p>
            <h2 className="mt-8 mb-4 text-2xl font-bold text-zinc-900">{t.heading}</h2>
            <ul className="space-y-2 text-zinc-600">
              {t.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AboutPage() {
  return <AboutPageContent locale="en" />;
}
