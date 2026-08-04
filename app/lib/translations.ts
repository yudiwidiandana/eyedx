export type Locale = "en" | "id";

export const locales = ["en", "id"] as const;

export const translations = {
  en: {
    nav: {
      home: "Home",
      diagnosis: "Diagnosis",
      about: "About",
    },
    hero: {
      title: "Diagnose Eye Diseases Quickly & Accurately",
      description:
        "Get a fast and reliable diagnosis for your eye condition with modern AI technology. Easy to use and designed for early detection.",
      ctaPrimary: "Start Diagnosis",
      ctaSecondary: "Learn More",
    },
    aboutPage: {
      title: "About EyeDx",
      intro1:
        "EyeDx is an AI-powered eye disease diagnosis platform designed to provide fast and accurate early detection.",
      intro2:
        "With the latest technology, we help you identify various eye conditions quickly and easily.",
      heading: "Key Features",
      features: ["Fast and accurate diagnosis", "Modern AI technology", "Easy to use", "Instant results"],
    },
    diagnosisPage: {
      title: "Eye Disease Diagnosis",
      description:
        "The diagnosis page will be available soon. Here you can upload an eye photo to receive an automatic assessment.",
    },
    language: {
      label: "Language",
      current: "English",
      switcherHint: "Choose your preferred language",
    },
  },
  id: {
    nav: {
      home: "Beranda",
      diagnosis: "Diagnosis",
      about: "Tentang",
    },
    hero: {
      title: "Diagnosa Penyakit Mata dengan Cepat & Akurat",
      description:
        "Dapatkan hasil skrining kondisi mata Anda secara cepat dengan teknologi AI modern, mudah digunakan, dan dirancang untuk mendukung deteksi dini.",
      ctaPrimary: "Mulai Diagnosis",
      ctaSecondary: "Pelajari Lebih Lanjut",
    },
    aboutPage: {
      title: "Tentang EyeDx",
      intro1:
        "EyeDx adalah platform diagnosis penyakit mata berbasis AI yang dirancang untuk memberikan deteksi dini yang cepat dan akurat.",
      intro2:
        "Dengan teknologi terkini, kami membantu Anda mengidentifikasi berbagai kondisi mata dengan cepat dan mudah.",
      heading: "Fitur Utama",
      features: ["Diagnosis cepat dan akurat", "Teknologi AI modern", "Mudah digunakan", "Hasil instan"],
    },
    diagnosisPage: {
      title: "Diagnosis Penyakit Mata",
      description:
        "Halaman diagnosis akan segera hadir. Di sini Anda dapat mengunggah foto mata untuk mendapatkan penilaian otomatis.",
    },
    language: {
      label: "Bahasa",
      current: "Bahasa Indonesia",
      switcherHint: "Pilih bahasa yang Anda inginkan",
    },
  },
} as const;
