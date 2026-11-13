import { notFound } from "next/navigation";
import { getDiagnosisResult } from "../../../lib/db";
import { getSessionUser } from "../../../lib/auth";
import { resolveDiagnosisResults } from "../../../lib/expertSystem";
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

  // hanya pemilik hasil atau admin/expert yang boleh membukanya
  const sessionUser = await getSessionUser();
  const isOwner = !!sessionUser && sessionUser.sub === record.userId;
  const isStaff = sessionUser?.role === "admin" || sessionUser?.role === "expert";
  if (!isOwner && !isStaff) {
    notFound();
  }

  const { responses, results: diagnosisResults } = await resolveDiagnosisResults(record);

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
