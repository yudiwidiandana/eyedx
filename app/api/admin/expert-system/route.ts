import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { getExpertSystem, createExpertSystemEntry } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  req.cookies.get("next-auth.session-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'expert')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  req.cookies.get("next-auth.session-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'expert')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
