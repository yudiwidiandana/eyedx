import Header from "../components/Header";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <main className="flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-zinc-900 mb-6">
            Tentang EyeDx
          </h1>
          <div className="prose prose-zinc max-w-none">
            <p className="text-lg text-zinc-600 mb-4">
              EyeDx adalah platform diagnosis penyakit mata berbasis kecerdasan buatan 
              yang dirancang untuk memberikan deteksi dini dan akurat.
            </p>
            <p className="text-lg text-zinc-600 mb-4">
              Dengan teknologi terkini, kami membantu Anda mengidentifikasi berbagai 
              kondisi mata dengan cepat dan mudah.
            </p>
            <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">
              Fitur Utama
            </h2>
            <ul className="text-zinc-600 space-y-2">
              <li>Diagnosis cepat dan akurat</li>
              <li>Teknologi AI terkini</li>
              <li>Mudah digunakan</li>
              <li>Hasil instan</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
