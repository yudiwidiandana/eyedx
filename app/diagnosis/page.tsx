"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";

export function DiagnosisPageContent({ locale }: { locale: Locale }) {
  const t = translations[locale].diagnosisPage;
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<{ name?: string; age?: string; gender?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; age?: string; gender?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!age || parseInt(age) <= 0 || parseInt(age) > 150) {
      newErrors.age = "Valid age is required";
    }

    if (!gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      const params = new URLSearchParams({
        name: name.trim(),
        age: age,
        gender: gender,
      });
      router.push(`/${locale === "en" ? "" : locale + "/"}questionnaire?${params.toString()}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="relative flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900">{t.title}</h1>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-zinc-700">
              <span className="font-semibold">{t.nameLabel}</span>
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`rounded-lg border ${
                  errors.name ? "border-red-500" : "border-zinc-300"
                } bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-700">
              <span className="font-semibold">{t.ageLabel}</span>
              <input
                type="number"
                placeholder={t.agePlaceholder}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`rounded-lg border ${
                  errors.age ? "border-red-500" : "border-zinc-300"
                } bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              />
              {errors.age && <span className="text-xs text-red-500">{errors.age}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-700">
              <span className="font-semibold">{t.genderLabel}</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`rounded-lg border ${
                  errors.gender ? "border-red-500" : "border-zinc-300"
                } bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              >
                <option value="">{t.genderPlaceholder}</option>
                <option value="laki-laki">{t.genderMale}</option>
                <option value="perempuan">{t.genderFemale}</option>
                <option value="lainnya">{t.genderOther}</option>
              </select>
              {errors.gender && <span className="text-xs text-red-500">{errors.gender}</span>}
            </label>
          </div>

          <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-700">{t.description}</p>
        </div>

        <div className="absolute bottom-20 left-4 right-4 flex items-center justify-between gap-4">
          <Link
            href={`/${locale === "en" ? "" : locale}`}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            {t.backButton}
          </Link>
          <button 
            onClick={handleNext}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {t.nextButton}
          </button>
        </div>

        <p className="absolute bottom-4 right-4 max-w-md text-right text-sm italic text-zinc-500">
          {t.disclaimer}
        </p>
      </main>
    </div>
  );
}

export default function DiagnosisPage() {
  return <DiagnosisPageContent locale="en" />;
}
