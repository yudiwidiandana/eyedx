import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/requireRole";
import { getSymptoms, createSymptom } from "@/app/lib/db";
import { isValidSymptomCode } from "@/app/lib/symptomUtils";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireRole(req, ['admin']);
    if (error) return error;

    const symptoms = await getSymptoms();
    return NextResponse.json({ symptoms });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireRole(req, ['admin']);
    if (error) return error;

    const body = await req.json();
    const { kodeGejala, namaGejala, symptomsName } = body;

    if (!kodeGejala || !namaGejala || !symptomsName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidSymptomCode(kodeGejala)) {
      return NextResponse.json(
        { error: "Symptom code must match the format G01-G39 (e.g. G07)" },
        { status: 400 }
      );
    }

    const no = await createSymptom({ kodeGejala, namaGejala, symptomsName });
    return NextResponse.json({ success: true, no });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
