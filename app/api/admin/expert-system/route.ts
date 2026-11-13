import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/requireRole";
import { getExpertSystem, createExpertSystemEntry } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireRole(req, ['admin', 'expert']);
    if (error) return error;

    const expertSystem = await getExpertSystem();
    return NextResponse.json({ expertSystem });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireRole(req, ['admin', 'expert']);
    if (error) return error;

    const body = await req.json();
    const { kodeGejala, cf } = body;

    if (!kodeGejala || !cf) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const no = await createExpertSystemEntry({ kodeGejala, cf });
    return NextResponse.json({ success: true, no });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
