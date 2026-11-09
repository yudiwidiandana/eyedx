import { notFound } from "next/navigation";
import { getDiagnosisResult } from "../../../lib/db";
import { decodeResponses, calculateDiagnosis } from "../../../lib/expertSystem";
import { ResultsView } from "../../../results/page";
import { locales, type Locale } from "../../../lib/translations";

export const dynamic = "force-dynamic";

export default async function LocaleSavedResultPage({
  params,
}: {
  params: Promise<{ locale: string; uuid: string }>;
}) {
  const { locale, uuid } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const record = await getDiagnosisResult(uuid);

  if (!record) {
    notFound();
  }

  const responses = await decodeResponses(record.responses);
  const diagnosisResults = await calculateDiagnosis(responses);

  return (
    <ResultsView
      locale={locale as Locale}
      patientName={record.name}
      patientAge={String(record.age)}
      patientGender={record.gender}
      responses={responses}
      questionsAsked={record.questionsAsked}
      diagnosisResults={diagnosisResults}
      savedUuid={record.id}
    />
  );
}
