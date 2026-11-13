import { NextRequest, NextResponse } from "next/server";
import { saveDiagnosisResult, getUserById } from "../../lib/db";
import { verifyToken } from "../../lib/auth";
import { calculateDiagnosis, decodeResponses } from "../../lib/expertSystem";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: {
    responses?: unknown;
    questionsAsked?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const responses = typeof body.responses === "string" ? body.responses : "";
  const questionsAsked =
    typeof body.questionsAsked === "number" ? body.questionsAsked : 0;

  // nama/umur/gender selalu diambil dari akun yang login, bukan dari body klien (T25)
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ||
                request.cookies.get("next-auth.session-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = payload.sub;
  const account = await getUserById(userId);
  if (!account) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { name, age, gender } = account;
  if (!name || !age || age <= 0 || age > 150 || !gender) {
    return NextResponse.json({ error: "Missing or invalid patient data" }, { status: 400 });
  }

  try {
    // hitung di sisi server dari string jawaban mentah, lalu simpan hasilnya sebagai
    // snapshot supaya hasil ini tidak ikut berubah kalau pakar mengubah CF di panel admin (T3)
    let resultsSnapshot: string | undefined;
    const decodedResponses = await decodeResponses(responses);
    if (decodedResponses.length > 0) {
      const diagnosisResults = await calculateDiagnosis(decodedResponses);
      resultsSnapshot = JSON.stringify({
        responses: decodedResponses,
        results: diagnosisResults,
      });
    }

    const id = await saveDiagnosisResult({
      name,
      age: Math.floor(age),
      gender,
      responses,
      questionsAsked,
      resultsSnapshot,
    }, userId);
    return NextResponse.json({ id, url: `/results/${id}` });
  } catch (error) {
    console.error("Failed to save diagnosis result:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json({ error: "Failed to save result", details: errorMessage }, { status: 500 });
  }
}
