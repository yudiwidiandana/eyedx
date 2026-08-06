"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";
import { getAllSymptoms, encodeResponses, getIllnessName } from "../lib/expertSystem";
import { getActiveDiseases, getNextQuestion } from "../lib/decisionTree";
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

  // State
  const [responses, setResponses] = useState<SymptomResponse[]>(
    allSymptoms.map((symptom) => ({
      symptomCode: symptom.kodeGejala,
      symptomName: symptom.namaGejala,
      userCF: 0,
    }))
  );
  const [currentSymptom, setCurrentSymptom] = useState<Symptom | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>("none");
  const [answeredSymptoms, setAnsweredSymptoms] = useState<string[]>([]);
  const [activeDiseases, setActiveDiseases] = useState<string[]>(['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);

  // Redirect if no patient info
  useEffect(() => {
    if (!patientName || !patientAge || !patientGender) {
      router.push(`/${locale === "en" ? "" : locale + "/"}diagnosis`);
    }
  }, [patientName, patientAge, patientGender, locale, router]);

  // Initialize first question
  useEffect(() => {
    if (patientName && !currentSymptom) {
      const nextQuestion = getNextQuestion(responses, allSymptoms, answeredSymptoms);
      if (nextQuestion) {
        setCurrentSymptom(nextQuestion);
      } else {
        // No questions to ask - go to results
        handleFinish();
      }
    }
  }, [patientName, currentSymptom]);

  // Update selected severity when current symptom changes
  useEffect(() => {
    if (currentSymptom) {
      const response = responses.find(r => r.symptomCode === currentSymptom.kodeGejala);
      if (response) {
        const severity = Object.entries(severityCFMap).find(
          ([_, cf]) => cf === response.userCF
        )?.[0] as SeverityLevel;
        setSelectedSeverity(severity || "none");
      }
    }
  }, [currentSymptom, responses]);

  const handleSeverityChange = (severity: SeverityLevel) => {
    setSelectedSeverity(severity);
  };

  const updateResponsesAndRecalculate = (symptomCode: string, userCF: number) => {
    // Update responses
    const newResponses = responses.map(r =>
      r.symptomCode === symptomCode ? { ...r, userCF } : r
    );
    setResponses(newResponses);

    // Recalculate active diseases
    const newActiveDiseases = getActiveDiseases(newResponses);
    setActiveDiseases(newActiveDiseases);

    return newResponses;
  };

  const handleNext = () => {
    if (!currentSymptom) return;

    // Save current answer
    const userCF = severityCFMap[selectedSeverity];
    const newResponses = updateResponsesAndRecalculate(currentSymptom.kodeGejala, userCF);

    // Add to answered list and history
    const newAnsweredSymptoms = [...answeredSymptoms, currentSymptom.kodeGejala];
    setAnsweredSymptoms(newAnsweredSymptoms);
    setQuestionHistory([...questionHistory, currentSymptom.kodeGejala]);

    // Get next question with updated answered list
    const nextQuestion = getNextQuestion(newResponses, allSymptoms, newAnsweredSymptoms);
    
    if (nextQuestion) {
      setCurrentSymptom(nextQuestion);
    } else {
      // No more questions - go to results
      handleFinish();
    }
  };

  const handleBack = () => {
    if (questionHistory.length === 0) return;

    // Remove last question from history
    const newHistory = [...questionHistory];
    const previousSymptomCode = newHistory.pop()!;
    setQuestionHistory(newHistory);

    // Remove from answered list
    const newAnsweredSymptoms = answeredSymptoms.filter(code => code !== previousSymptomCode);
    setAnsweredSymptoms(newAnsweredSymptoms);

    // Find previous symptom
    const previousSymptom = allSymptoms.find(s => s.kodeGejala === previousSymptomCode);
    if (previousSymptom) {
      setCurrentSymptom(previousSymptom);
    }
  };

  const handleFinish = () => {
    const encodedResponses = encodeResponses(responses);
    const params = new URLSearchParams({
      name: patientName,
      age: patientAge,
      gender: patientGender,
      responses: encodedResponses,
      questionsAsked: answeredSymptoms.length.toString(),
    });
    router.push(`/${locale === "en" ? "" : locale + "/"}results?${params.toString()}`);
  };

  if (!patientName || !currentSymptom) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-zinc-600">Loading...</p>
        </main>
      </div>
    );
  }

  const totalSymptoms = allSymptoms.length;
  const answeredCount = answeredSymptoms.length;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-4xl">
          {/* Progress info */}
          <div className="mb-8">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
              <div className="space-y-1">
                <p className="text-zinc-600">
                  {t.questionsAnswered.replace("{count}", answeredCount.toString())}
                </p>
                <p className="text-zinc-600">
                  {t.possibleDiseases.replace("{count}", activeDiseases.length.toString())}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">{t.focusingOn}</p>
                <p className="text-sm font-medium text-blue-600">
                  {activeDiseases.map(d => getIllnessName(d)).join(", ")}
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(answeredCount / totalSymptoms) * 100}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="mb-2 text-2xl font-bold text-zinc-900">{t.question}</h1>
            <p className="mb-8 text-2xl font-semibold text-blue-600 sm:text-3xl">
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              onClick={handleBack}
              disabled={questionHistory.length === 0}
              className="w-full rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {t.backButton}
            </button>
            <button
              onClick={handleNext}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              {t.nextButton}
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
