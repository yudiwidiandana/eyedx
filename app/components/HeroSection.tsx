import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative flex-1  flex items-center justify-center px-6 sm:px-8 lg:px-12 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero/Background.jpg"
          alt="Hero Background"
          fill
          className="object-cover object-[center_70%]"
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
          Diagnosis Penyakit Mata dengan Cepat & Akurat
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
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
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold rounded-lg border-2 border-white hover:border-zinc-200 transition-colors shadow-lg"
          >
            Pelajari Lebih Lanjut
          </Link>
        </div>
      </div>
    </section>
  );
}
