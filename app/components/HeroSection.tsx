import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex-1 flex items-center justify-center px-6 py-20 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
          Diagnosis Penyakit Mata dengan Cepat & Akurat
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Dapatkan diagnosis kondisi mata Anda dengan teknologi kecerdasan buatan terkini. 
          Cepat, akurat, dan mudah digunakan untuk deteksi dini berbagai penyakit mata.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/diagnosis"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Mulai Diagnosis
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold rounded-lg border-2 border-zinc-300 hover:border-zinc-400 transition-colors dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:border-zinc-600"
          >
            Pelajari Lebih Lanjut
          </Link>
        </div>
      </div>
    </section>
  );
}
