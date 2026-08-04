import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";

export function DiagnosisPageContent({ locale }: { locale: Locale }) {
  const t = translations[locale].diagnosisPage;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="relative flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900">{t.title}</h1>
          <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-700">{t.description}</p>
        </div>

        <div className="absolute bottom-16 left-4 right-4 flex items-center justify-between gap-4">
          <button className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50">
            Kembali
          </button>
          <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            Hasil Diagnosis
          </button>
        </div>

        <p className="absolute bottom-4 right-4 max-w-md text-right text-sm italic text-zinc-500">
          Hasil analisis AI ini adalah skrining awal dan bukan pengganti diagnosis dokter mata spesialis.
        </p>
      </main>
    </div>
  );
}

export default function DiagnosisPage() {
  return <DiagnosisPageContent locale="en" />;
}
