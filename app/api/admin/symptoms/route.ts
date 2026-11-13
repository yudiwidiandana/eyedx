import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { getSymptoms, createSymptom } from "@/app/lib/db";
import { isValidSymptomCode } from "@/app/lib/symptomUtils";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  req.cookies.get("next-auth.session-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  req.cookies.get("next-auth.session-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
