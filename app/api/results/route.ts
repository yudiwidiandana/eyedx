import { NextResponse } from "next/server";
import { saveDiagnosisResult } from "../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    name?: unknown;
    age?: unknown;
    gender?: unknown;
    responses?: unknown;
    questionsAsked?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const age = typeof body.age === "number" ? body.age : NaN;
  const gender = typeof body.gender === "string" ? body.gender.trim() : "";
  const responses = typeof body.responses === "string" ? body.responses : "";
  const questionsAsked =
    typeof body.questionsAsked === "number" ? body.questionsAsked : 0;

  if (!name || !Number.isFinite(age) || age <= 0 || age > 150 || !gender) {
    return NextResponse.json({ error: "Missing or invalid patient data" }, { status: 400 });
  }

  try {
    const id = await saveDiagnosisResult({
      name,
      age: Math.floor(age),
      gender,
      responses,
      questionsAsked,
    });
    return NextResponse.json({ id, url: `/results/${id}` });
  } catch (error) {
    console.error("Failed to save diagnosis result:", error);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
}
