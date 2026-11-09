import { NextRequest, NextResponse } from "next/server";
import { calculateDiagnosis, decodeResponses } from "../../lib/expertSystem";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { responses?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const encodedResponses = typeof body.responses === "string" ? body.responses : "";

  if (!encodedResponses) {
    return NextResponse.json({ error: "Missing responses parameter" }, { status: 400 });
  }

  try {
    const decodedResponses = await decodeResponses(encodedResponses);
    
    if (decodedResponses.length === 0) {
      return NextResponse.json({ error: "No valid responses found" }, { status: 400 });
    }

    const diagnosisResults = await calculateDiagnosis(decodedResponses);
    
    return NextResponse.json({ 
      responses: decodedResponses,
      results: diagnosisResults 
    });
  } catch (error) {
    console.error("Failed to calculate diagnosis:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to calculate diagnosis", details: errorMessage }, { status: 500 });
  }
}
