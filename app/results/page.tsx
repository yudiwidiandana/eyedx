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

  const hasSymptoms = diagnosisResults.some(d => d.percentage > 0);

  // Filter diseases with confidence > 10% for display
  const hasAnyDiseases = diagnosisResults.filter(d => d.percentage > 10);
  const primaryDiagnosis = hasAnyDiseases[0];
  const otherDiagnoses = hasAnyDiseases.slice(1);

  // Determine confidence level
  const getConfidenceLevel = (percentage: number) => {
    if (percentage >= 70) return { label: t.confidenceHigh, color: "green" };
    if (percentage >= 40) return { label: t.confidenceMedium, color: "yellow" };
    if (percentage >= 10) return { label: t.confidenceLow, color: "red" };
    return { label: t.confidenceVeryLow, color: "gray" };
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "green": return "bg-green-100 text-green-800";
      case "yellow": return "bg-yellow-100 text-yellow-800";
      case "red": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBarClasses = (color: string) => {
    switch (color) {
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const formatSymptoms = (symptoms: string[], maxVisible: number = 4): string => {
    if (symptoms.length === 0) return t.noSymptoms;

    const visible = symptoms.slice(0, maxVisible);
    const remaining = symptoms.length - maxVisible;

    if (remaining > 0) {
      return visible.join(", ") + " " + t.andMore.replace("{count}", remaining.toString());
    }

    return visible.join(", ");
  };

  const renderDiagnosisCard = (
    diagnosis: DiagnosisResult,
    isPrimary: boolean,
    index: number
  ) => {
    const confidence = getConfidenceLevel(diagnosis.percentage);
    const badgeClasses = getBadgeClasses(confidence.color);
    const barClasses = getBarClasses(confidence.color);

    return (
      <div
        key={diagnosis.diseaseCode}
        className={`rounded-2xl border bg-white shadow-sm ${
          isPrimary
            ? "border-blue-300 bg-blue-50/50 shadow-md ring-1 ring-blue-100"
            : "border-zinc-200"
        }`}
      >
        <div className={`p-6 ${isPrimary ? "sm:p-8" : ""}`}>
          {/* Header with rank and badge */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isPrimary ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {index + 1}
              </span>
              {isPrimary && (
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  {t.primaryDiagnosis}
                </span>
              )}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses}`}>
              {confidence.label}
            </span>
          </div>

          {/* Disease name */}
          <h3 className={`font-bold text-zinc-900 ${isPrimary ? "text-2xl" : "text-xl"}`}>
            {diagnosis.diseaseName}
          </h3>

          {/* Confidence percentage and progress bar */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-bold ${isPrimary ? "text-4xl" : "text-3xl"} text-zinc-900`}>
              {diagnosis.percentage}%
            </span>
            <span className="text-sm text-zinc-500">{t.confidence}</span>
          </div>

          {/* Confidence progress bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className={`h-full ${barClasses} transition-all duration-500`}
              style={{ width: `${Math.max(diagnosis.percentage, 2)}%` }}
            />
          </div>

          {/* Contributing symptoms */}
          <div className="mt-4">
            <p className="mb-1 text-sm font-semibold text-zinc-700">
              {t.contributingSymptoms}:
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              {formatSymptoms(diagnosis.contributingSymptoms)}
            </p>
          </div>
        </div>
      </div>
    );
  };

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

          {/* Diagnosis Results Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">{t.allResultsTitle}</h2>

            {hasSymptoms ? (
              <>
                {/* Primary Diagnosis */}
                {primaryDiagnosis && renderDiagnosisCard(primaryDiagnosis, true, 0)}

                {/* Other Possibilities */}
                {otherDiagnoses.length > 0 && (
                  <>
                    <h3 className="pt-2 text-lg font-semibold text-zinc-700">
                      {t.otherPossibilities}
                    </h3>
                    <div className="space-y-4">
                      {otherDiagnoses.map((diagnosis, index) =>
                        renderDiagnosisCard(diagnosis, false, index + 1)
                      )}
                    </div>
                  </>
                )}
              </>
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
