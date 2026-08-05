import Link from "next/link";
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

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-zinc-700">
              <span className="font-semibold">Nama</span>
              <input
                type="text"
                placeholder="Masukkan nama"
                className="rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-700">
              <span className="font-semibold">Umur</span>
              <input
                type="number"
                placeholder="Masukkan umur"
                className="rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-700">
              <span className="font-semibold">Jenis Kelamin</span>
              <select
                className="rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </label>
          </div>

          <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-700">{t.description}</p>
        </div>

        <div className="absolute bottom-20 left-4 right-4 flex items-center justify-between gap-4">
          <Link
            href={`/${locale === "en" ? "" : locale}`}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Kembali
          </Link>
          <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            Selanjutnya
          </button>
        </div>

        <p className="absolute bottom-4 right-4 max-w-md text-right text-sm italic text-zinc-500">
          Penting: Hasil analisis ini adalah deteksi dini, bukan diagnosis final medis. Harap konsultasikan kembali gejala Anda dengan dokter spesialis mata untuk penanganan lebih lanjut.
        </p>
      </main>
    </div>
  );
}

export default function DiagnosisPage() {
  return <DiagnosisPageContent locale="en" />;
}
