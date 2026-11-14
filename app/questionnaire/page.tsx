"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";
import { useAuth } from "../lib/useAuth";
import { encodeResponses } from "../lib/symptomUtils";
import { severityCFMap, type SeverityLevel, type SymptomResponse, type Symptom } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const dynamic = 'force-dynamic';

function QuestionnaireContent({ locale }: { locale: Locale }) {
  const t = translations[locale].questionnairePage;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const profileIncomplete = !authLoading && (!user || !user.age || !user.gender);

  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SymptomResponse[]>([]);

  const totalQuestions = allSymptoms.length;

  const currentResponse = responses[currentQuestionIndex];
  const selectedSeverity = currentResponse
    ? (Object.entries(severityCFMap).find(
        ([, cf]) => cf === currentResponse.userCF
      )?.[0] as SeverityLevel) || "none"
    : "none";

  useEffect(() => {
    fetch('/api/symptoms')
      .then(res => res.json())
      .then(data => {
        setAllSymptoms(data.symptoms || []);
        setResponses((data.symptoms || []).map((symptom: Symptom) => ({
          symptomCode: symptom.kodeGejala,
          symptomName: symptom.namaGejala,
          userCF: 0,
        })));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (profileIncomplete) {
      router.push(`/${locale === "en" ? "" : locale + "/"}diagnosis`);
    }
  }, [profileIncomplete, locale, router]);

  const handleSeverityChange = (severity: SeverityLevel) => {

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
      responses: encodedResponses,
      questionsAsked: responses.filter(r => r.userCF > 0).length.toString(),
    });
    router.push(`/${locale === "en" ? "" : locale + "/"}results?${params.toString()}`);
  };

  if (authLoading || profileIncomplete || loading || allSymptoms.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">{translations[locale].common.loading}</p>
        </main>
      </div>
    );
  }

  const currentSymptom = allSymptoms[currentQuestionIndex];
  const answeredCount = responses.filter(r => r.userCF > 0).length;
  // selaras dengan teks "Pertanyaan X dari Y"; 0 bila gejala belum termuat
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const severityOptions: { value: SeverityLevel; label: string; activeClass: string }[] = [
    { value: "none", label: t.severityNone, activeClass: "border-zinc-500 bg-zinc-50" },
    { value: "mild", label: t.severityMild, activeClass: "border-green-500 bg-green-50" },
    { value: "moderate", label: t.severityModerate, activeClass: "border-yellow-500 bg-yellow-50" },
    { value: "fairly-severe", label: t.severityFairlySevere, activeClass: "border-orange-500 bg-orange-50" },
    { value: "very-severe", label: t.severityVerySevere, activeClass: "border-red-500 bg-red-50" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pt-8">
      <Header locale={locale} />
      <main className="relative flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          {/* Progress info */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                {t.progress.replace("{current}", String(currentQuestionIndex + 1)).replace("{total}", String(totalQuestions))}
              </p>
              <p className="text-muted-foreground">
                {t.answered.replace("{count}", String(answeredCount))}
              </p>
            </div>

            <Progress value={progress} />
          </div>

          {/* Question card */}
          <Card>
            <CardContent>
              <h1 className="mb-2 text-2xl font-bold text-foreground">{t.question}</h1>
              <p className="mb-8 text-3xl font-semibold text-primary">
                {currentSymptom.namaGejala}
              </p>

              {/* Severity options */}
              <div className="mb-8">
                <p className="mb-4 text-sm font-semibold text-foreground">{t.severityLabel}</p>
                <RadioGroup
                  value={selectedSeverity}
                  onValueChange={(value) => handleSeverityChange(value as SeverityLevel)}
                  className="space-y-3"
                >
                  {severityOptions.map(({ value, label, activeClass }) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition ${
                        selectedSeverity === value
                          ? activeClass
                          : "border-border bg-background hover:border-muted-foreground/40"
                      }`}
                    >
                      <RadioGroupItem value={value} className="size-5" />
                      <span className="text-lg font-medium text-foreground">{label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className="h-11"
            >
              {t.backButton}
            </Button>
            <Button onClick={handleNext} className="h-11">
              {currentQuestionIndex === totalQuestions - 1 ? t.finishButton : t.nextButton}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export function QuestionnairePageContent({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-background">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">{translations[locale].common.loading}</p>
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
