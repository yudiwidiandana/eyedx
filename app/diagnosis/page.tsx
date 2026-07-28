import Header from "../components/Header";

export default function DiagnosisPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">
            Diagnosis Penyakit Mata
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Halaman diagnosis akan segera hadir. Di sini Anda dapat mengunggah foto mata 
            untuk mendapatkan diagnosis otomatis.
          </p>
        </div>
      </main>
    </div>
  );
}
