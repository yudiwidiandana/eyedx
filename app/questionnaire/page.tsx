"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";
import { getAllSymptoms, encodeResponses, getIllnessName } from "../lib/expertSystem";
import { severityCFMap, type SeverityLevel, type SymptomResponse, type Symptom } from "../lib/types";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function QuestionnaireContent({ locale }: { locale: Locale }) {
  const t = translations[locale].questionnairePage;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Patient info from URL
  const patientName = searchParams.get("name") || "";
  const patientAge = searchParams.get("age") || "";
  const patientGender = searchParams.get("gender") || "";

  // Get all symptoms
  const allSymptoms = getAllSymptoms();
  const totalQuestions = allSymptoms.length;

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SymptomResponse[]>(
    allSymptoms.map((symptom) => ({
      symptomCode: symptom.kodeGejala,
      symptomName: symptom.namaGejala,
      userCF: 0,
    }))
  );
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>("none");

  // Redirect if no patient info
  useEffect(() => {
    if (!patientName || !patientAge || !patientGender) {
      router.push(`/${locale === "en" ? "" : locale + "/"}diagnosis`);
    }
  }, [patientName, patientAge, patientGender, locale, router]);

  // Update selected severity when current question changes
  useEffect(() => {
    const currentResponse = responses[currentQuestionIndex];
    if (currentResponse) {
      const severity = Object.entries(severityCFMap).find(
        ([_, cf]) => cf === currentResponse.userCF
      )?.[0] as SeverityLevel;
      setSelectedSeverity(severity || "none");
    }
  }, [currentQuestionIndex, responses]);

  const handleSeverityChange = (severity: SeverityLevel) => {
    setSelectedSeverity(severity);

    // Update response
    const userCF = severityCFMap[severity];
    const newResponses = responses.map(r =>
      r.symptomCode === allSymptoms[currentQuestionIndex].kodeGejala ? { ...r, userCF } : r
    );
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question - navigate to results
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    const encodedResponses = encodeResponses(responses);
    const params = new URLSearchParams({
      name: patientName,
      age: patientAge,
      gender: patientGender,
      responses: encodedResponses,
      questionsAsked: responses.filter(r => r.userCF > 0).length.toString(),
    });
    router.push(`/${locale === "en" ? "" : locale + "/"}results?${params.toString()}`);
  };

  if (!patientName) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-zinc-600">Loading...</p>
        </main>
      </div>
    );
  }

  const currentSymptom = allSymptoms[currentQuestionIndex];
  const answeredCount = responses.filter(r => r.userCF > 0).length;
  const progress = ((answeredCount + 1) / totalQuestions) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="relative flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          {/* Progress info */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between text-sm">
              <p className="text-zinc-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <p className="text-zinc-600">
                {answeredCount} questions answered
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-2xl font-bold text-zinc-900">{t.question}</h1>
            <p className="mb-8 text-3xl font-semibold text-blue-600">
              {currentSymptom.namaGejala}
            </p>

            {/* Severity options */}
            <div className="mb-8">
              <p className="mb-4 text-sm font-semibold text-zinc-700">{t.severityLabel}</p>
              <div className="space-y-3">
                {[
                  { value: "none" as SeverityLevel, label: t.severityNone, color: "zinc" },
                  { value: "mild" as SeverityLevel, label: t.severityMild, color: "green" },
                  { value: "moderate" as SeverityLevel, label: t.severityModerate, color: "yellow" },
                  { value: "fairly-severe" as SeverityLevel, label: t.severityFairlySevere, color: "orange" },
                  { value: "very-severe" as SeverityLevel, label: t.severityVerySevere, color: "red" },
                ].map(({ value, label, color }) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition ${
                      selectedSeverity === value
                        ? `border-${color}-500 bg-${color}-50`
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={value}
                      checked={selectedSeverity === value}
                      onChange={() => handleSeverityChange(value)}
                      className="h-5 w-5 cursor-pointer"
                    />
                    <span className="text-lg font-medium text-zinc-900">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.backButton}
            </button>
            <button
              onClick={handleNext}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {currentQuestionIndex === totalQuestions - 1 ? t.finishButton : t.nextButton}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export function QuestionnairePageContent({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-zinc-600">Loading...</p>
        </main>
      </div>
    }>
      <QuestionnaireContent locale={locale} />
    </Suspense>
  );
}

export default function QuestionnairePage() {
  return <QuestionnairePageContent locale="en" />;
}