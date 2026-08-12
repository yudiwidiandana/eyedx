import { notFound } from "next/navigation";
import { getDiagnosisResult } from "../../lib/db";
import { decodeResponses } from "../../lib/expertSystem";
import { ResultsView } from "../page";
import type { Locale } from "../../lib/translations";

export const dynamic = "force-dynamic";

export default async function SavedResultPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const record = await getDiagnosisResult(uuid);

  if (!record) {
    notFound();
  }

  return (
    <ResultsView
      locale="en"
      patientName={record.name}
      patientAge={String(record.age)}
      patientGender={record.gender}
      responses={decodeResponses(record.responses)}
      questionsAsked={record.questionsAsked}
      savedUuid={record.id}
    />
  );
}
