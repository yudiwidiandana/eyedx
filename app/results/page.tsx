"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { translations, type Locale } from "../lib/translations";
import type { DiagnosisResult, SymptomResponse } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Shared props: either from query params (fresh run) or from saved DB record (retrieval)
export interface ResultsViewProps {
  locale: Locale;
  patientName: string;
  patientAge: string;
  patientGender: string;
  responses: SymptomResponse[];
  questionsAsked: number;
  diagnosisResults: DiagnosisResult[];
  savedUuid?: string;
}

export function ResultsView({
  locale,
  patientName,
  patientAge,
  patientGender,
  responses,
  questionsAsked,
  diagnosisResults,
  savedUuid,
}: ResultsViewProps) {
  const t = translations[locale].resultsPage;

  if (diagnosisResults.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  // Filter diseases with confidence > 10% for display
  const hasAnyDiseases = diagnosisResults.filter(d => d.percentage > 10);
  const hasSymptoms = hasAnyDiseases.length > 0;
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
      <Card
        key={diagnosis.diseaseCode}
        className={
          isPrimary
            ? "border-blue-300 bg-blue-50/50 shadow-md ring-1 ring-blue-100"
            : ""
        }
      >
        <CardContent className={isPrimary ? "sm:px-8" : ""}>
          {/* Header with rank and badge */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isPrimary ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
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
          <h3 className={`font-bold text-foreground ${isPrimary ? "text-2xl" : "text-xl"}`}>
            {diagnosis.diseaseName}
          </h3>

          {/* Confidence percentage and progress bar */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-bold ${isPrimary ? "text-4xl" : "text-3xl"} text-foreground`}>
              {diagnosis.percentage}%
            </span>
            <span className="text-sm text-muted-foreground">{t.confidence}</span>
          </div>

          {/* Confidence progress bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${barClasses} transition-all duration-500`}
              style={{ width: `${Math.max(diagnosis.percentage, 2)}%` }}
            />
          </div>

          {/* Contributing symptoms */}
          <div className="mt-4">
            <p className="mb-1 text-sm font-semibold text-foreground">
              {t.contributingSymptoms}:
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {formatSymptoms(diagnosis.contributingSymptoms)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pt-8">
      <Header locale={locale} />
      <main className="flex-1 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-foreground">{t.title}</h1>

          {/* Efficiency Stats */}
          {questionsAsked > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-900">
                <p className="font-semibold">{t.efficiency}</p>
                <p className="text-lg text-blue-800">
                  {t.questionsAsked
                    .replace("{count}", questionsAsked.toString())
                    .replace("{total}", "39")}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Saved Result Link */}
          {savedUuid && (
            <SavedResultCard
              locale={locale}
              savedUuid={savedUuid}
              title={t.saveResultTitle}
              hint={t.saveResultHint}
              openLabel={t.openSavedResult}
              copyLabel={t.copyLink}
              copiedLabel={t.copied}
            />
          )}

          {/* Patient Information Card */}
          <Card>
            <CardContent>
              <h2 className="mb-4 text-xl font-semibold text-foreground">{t.patientInfo}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t.patientName}</p>
                  <p className="text-lg font-medium text-foreground">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.patientAge}</p>
                  <p className="text-lg font-medium text-foreground">{patientAge}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.patientGender}</p>
                  <p className="text-lg font-medium text-foreground">{patientGender}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis Results Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">{t.allResultsTitle}</h2>

            {hasSymptoms ? (
              <>
                {/* Primary Diagnosis */}
                {primaryDiagnosis && renderDiagnosisCard(primaryDiagnosis, true, 0)}

                {/* Other Possibilities */}
                {otherDiagnoses.length > 0 && (
                  <>
                    <h3 className="pt-2 text-lg font-semibold text-muted-foreground">
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
              <Card>
                <CardContent className="text-center">
                  <p className="text-lg text-foreground">{t.noSymptomsMessage}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Disclaimer */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-900">{t.disclaimer}</AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              render={<Link href={`/${locale === "en" ? "" : locale + "/"}diagnosis`} />}
              nativeButton={false}
              className="h-11"
            >
              {t.restartButton}
            </Button>
            <Button
              variant="outline"
              render={<Link href={`/${locale === "en" ? "" : locale}`} />}
              nativeButton={false}
              className="h-11"
            >
              {t.homeButton}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SavedResultCard({
  locale,
  savedUuid,
  title,
  hint,
  openLabel,
  copyLabel,
  copiedLabel,
}: {
  locale: Locale;
  savedUuid: string;
  title: string;
  hint: string;
  openLabel: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [origin, setOrigin] = useState('');
  const path = `/${locale === "en" ? "" : locale + "/"}results/${savedUuid}`;
  const fullUrl = origin ? `${origin}${path}` : path;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <Card className="border-green-300 bg-green-50">
      <CardContent>
        <h2 className="mb-2 text-xl font-semibold text-green-900">{title}</h2>
        <p className="mb-3 text-sm text-green-800">{hint}</p>
        <code className="block w-full rounded-lg border border-green-200 bg-white px-4 py-2 text-sm break-all text-foreground">
          {fullUrl}
        </code>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button
            render={<Link href={path} />}
            nativeButton={false}
            className="bg-green-600 hover:bg-green-700"
          >
            {openLabel}
          </Button>
          <CopyButton text={fullUrl} label={copyLabel} copiedLabel={copiedLabel} />
        </div>
      </CardContent>
    </Card>
  );
}

function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; ignore
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      className="border-green-300 text-green-700 hover:bg-green-50"
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}

// Fresh run from query params: computes + auto-saves + shows link
function FreshResultsContent({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientName = searchParams.get("name") || "";
  const patientAge = searchParams.get("age") || "";
  const patientGender = searchParams.get("gender") || "";
  const encodedResponses = searchParams.get("responses") || "";
  const questionsAsked = parseInt(searchParams.get("questionsAsked") || "0");

  const [savedUuid, setSavedUuid] = useState<string | undefined>(undefined);
  const [responses, setResponses] = useState<SymptomResponse[]>([]);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [loading, setLoading] = useState(true);
  // T20: cegah hasil yang sama tersimpan berkali-kali kalau halaman ini di-refresh,
  // atau kalau efek ini sempat dijalankan dua kali (React Strict Mode saat dev)
  const saveTriggeredRef = useRef(false);

  useEffect(() => {
    if (!patientName || !patientAge || !patientGender || !encodedResponses) {
      router.push(`/${locale === "en" ? "" : locale + "/"}diagnosis`);
      return;
    }

    const storageKey = `eyedx:savedResult:${encodedResponses}:${patientName}:${patientAge}:${patientGender}:${questionsAsked}`;

    (async () => {
      try {
        const diagnoseRes = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: encodedResponses }),
        });

        if (!diagnoseRes.ok) {
          router.push(`/${locale === "en" ? "" : locale + "/"}diagnosis`);
          return;
        }

        const diagnoseData = await diagnoseRes.json();
        setResponses(diagnoseData.responses);
        setDiagnosisResults(diagnoseData.results);
        setLoading(false);

        const existingUuid = sessionStorage.getItem(storageKey);
        if (existingUuid) {
          setSavedUuid(existingUuid);
          return;
        }

        if (saveTriggeredRef.current) return;
        saveTriggeredRef.current = true;

        const saveRes = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: patientName,
            age: parseInt(patientAge),
            gender: patientGender,
            responses: encodedResponses,
            questionsAsked,
          }),
        });

        if (saveRes.ok) {
          const saveData = await saveRes.json();
          sessionStorage.setItem(storageKey, saveData.id as string);
          setSavedUuid(saveData.id as string);
        }
      } catch (error) {
        console.error("Failed to load diagnosis:", error);
        router.push(`/${locale === "en" ? "" : locale + "/"}diagnosis`);
      }
    })();
  }, [patientName, patientAge, patientGender, encodedResponses, questionsAsked, locale, router]);

  if (loading || responses.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <ResultsView
      locale={locale}
      patientName={patientName}
      patientAge={patientAge}
      patientGender={patientGender}
      responses={responses}
      questionsAsked={questionsAsked}
      diagnosisResults={diagnosisResults}
      savedUuid={savedUuid}
    />
  );
}

export function ResultsPageContent({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-background">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </main>
      </div>
    }>
      <FreshResultsContent locale={locale} />
    </Suspense>
  );
}

export default function ResultsPage() {
  return <ResultsPageContent locale="en" />;
}
