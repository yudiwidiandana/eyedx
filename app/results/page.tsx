"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";
import { calculateDiagnosis, decodeResponses } from "../lib/expertSystem";
import type { DiagnosisResult } from "../lib/types";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function ResultsContent({ locale }: { locale: Locale }) {
  const t = translations[locale].resultsPage;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Patient info from URL
  const patientName = searchParams.get("name") || "";
  const patientAge = searchParams.get("age") || "";
  const patientGender = searchParams.get("gender") || "";
  const encodedResponses = searchParams.get("responses") || "";
  const questionsAsked = parseInt(searchParams.get("questionsAsked") || "0");

  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if no patient info
    if (!patientName || !patientAge || !patientGender) {
      router.push(`/${locale === "en" ? "" : locale + "/"}diagnosis`);
      return;
    }

    // Decode responses and calculate diagnosis
    const responses = decodeResponses(encodedResponses);
    const results = calculateDiagnosis(responses);
    setDiagnosisResults(results);
    setLoading(false);
  }, [patientName, patientAge, patientGender, encodedResponses, locale, router]);

  if (loading || !patientName) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-zinc-600">Loading...</p>
        </main>
      </div>
    );
  }

  const topDiagnosis = diagnosisResults[0];
  const hasSymptoms = topDiagnosis && topDiagnosis.percentage > 0;

  // Determine confidence level
  const getConfidenceLevel = (percentage: number) => {
    if (percentage >= 70) return { label: t.confidenceHigh, color: "green" };
    if (percentage >= 40) return { label: t.confidenceMedium, color: "yellow" };
    return { label: t.confidenceLow, color: "red" };
  };

  const confidence = hasSymptoms ? getConfidenceLevel(topDiagnosis.percentage) : null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-zinc-900">{t.title}</h1>

          {/* Efficiency Stats */}
          {questionsAsked > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">{t.efficiency}</p>
              <p className="text-lg text-blue-800">
                {t.questionsAsked
                  .replace("{count}", questionsAsked.toString())
                  .replace("{total}", "39")}
              </p>
            </div>
          )}

          {/* Patient Information Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900">{t.patientInfo}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm text-zinc-600">{t.patientName}</p>
                <p className="text-lg font-medium text-zinc-900">{patientName}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600">{t.patientAge}</p>
                <p className="text-lg font-medium text-zinc-900">{patientAge}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600">{t.patientGender}</p>
                <p className="text-lg font-medium text-zinc-900">{patientGender}</p>
              </div>
            </div>
          </div>

          {/* Diagnosis Result Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900">{t.diagnosisResult}</h2>

            {hasSymptoms ? (
              <div className="space-y-6">
                {/* Disease Name and Percentage */}
                <div className="rounded-lg bg-blue-50 p-6">
                  <p className="mb-2 text-sm font-medium text-blue-900">{t.confidence}</p>
                  <div className="mb-3 flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-blue-600">{topDiagnosis.percentage}%</p>
                    <p
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        confidence?.color === "green"
                          ? "bg-green-100 text-green-800"
                          : confidence?.color === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {confidence?.label}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-zinc-900">{topDiagnosis.diseaseName}</p>
                </div>

                {/* Contributing Symptoms */}
                {topDiagnosis.contributingSymptoms.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-zinc-900">
                      {t.contributingSymptoms}
                    </h3>
                    <ul className="space-y-2">
                      {topDiagnosis.contributingSymptoms.map((symptom, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-zinc-700"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-50 p-6 text-center">
                <p className="text-lg text-zinc-700">{t.noSymptomsMessage}</p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">{t.disclaimer}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale === "en" ? "" : locale + "/"}diagnosis`}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {t.restartButton}
            </Link>
            <Link
              href={`/${locale === "en" ? "" : locale}`}
              className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              {t.homeButton}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export function ResultsPageContent({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-zinc-600">Loading...</p>
        </main>
      </div>
    }>
      <ResultsContent locale={locale} />
    </Suspense>
  );
}

export default function ResultsPage() {
  return <ResultsPageContent locale="en" />;
}
