import { notFound } from "next/navigation";
import { getDiagnosisResult } from "../../lib/db";
import { decodeResponses, calculateDiagnosis } from "../../lib/expertSystem";
import { ResultsView } from "../page";

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

  const responses = await decodeResponses(record.responses);
  const diagnosisResults = await calculateDiagnosis(responses);

  return (
    <ResultsView
      locale="en"
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
