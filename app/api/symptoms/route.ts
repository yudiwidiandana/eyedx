import { NextResponse } from "next/server";
import { getSymptoms } from "../../lib/db";

export async function GET() {
  try {
    const symptoms = await getSymptoms();
    return NextResponse.json({ symptoms });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
