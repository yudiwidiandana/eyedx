import { NextRequest, NextResponse } from "next/server";
import { saveDiagnosisResult } from "../../lib/db";
import { verifyToken } from "../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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

  let userId: string | undefined;
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || 
                request.cookies.get("next-auth.session-token")?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      userId = payload.sub;
    }
  }

  try {
    const id = await saveDiagnosisResult({
      name,
      age: Math.floor(age),
      gender,
      responses,
      questionsAsked,
    }, userId);
    return NextResponse.json({ id, url: `/results/${id}` });
  } catch (error) {
    console.error("Failed to save diagnosis result:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json({ error: "Failed to save result", details: errorMessage }, { status: 500 });
  }
}
