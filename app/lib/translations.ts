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
        "INDICATOR OF SYMPTOM SEVERITY LEVEL:\n• MILD: Rarely appears, does not interfere with activities.\n• MODERATE: Appears several times a day, activities remain normal.\n• FAIRLY SEVERE: Often appears, somewhat difficult to resist, begins to interfere with activities.\n• VERY SEVERE: Continually appears, very painful and interferes with activities.",
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
        "INDIKATOR TINGKAT KEPARAHAN GEJALA:\n• RINGAN: Jarang muncul, tidak mengganggu aktivitas.\n• SEDANG: Muncul beberapa kali sehari, aktivitas masih normal.\n• CUKUP PARAH: Sering muncul, agak sulit ditahan, mulai mengganggu aktivitas.\n• SANGAT PARAH: Terus-menerus muncul, sangat nyeri & mengganggu aktivitas.",
    },
    language: {
      label: "Bahasa",
      current: "Bahasa Indonesia",
      switcherHint: "Pilih bahasa yang Anda inginkan",
    },
  },
} as const;
