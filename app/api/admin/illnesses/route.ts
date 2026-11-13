import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { getIllnesses, createIllness } from "@/app/lib/db";
import { CORE_ILLNESS_CODES } from "@/app/lib/illnessCodes";

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

    const illnesses = await getIllnesses();
    return NextResponse.json({ illnesses });
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
    const { kodePenyakit, namaPenyakit } = body;

    if (!kodePenyakit || !namaPenyakit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const kode = String(kodePenyakit).trim();

    // mesin CF hanya menghitung P1-P6, penyakit lain tersimpan tapi tidak pernah dihitung
    if (!CORE_ILLNESS_CODES.includes(kode)) {
      return NextResponse.json(
        { error: "Penyakit baru tidak dapat ditambahkan: mesin CF hanya menghitung P1-P6" },
        { status: 400 }
      );
    }

    if ((await getIllnesses()).some(i => i.kodePenyakit === kode)) {
      return NextResponse.json({ error: `Kode ${kode} sudah ada` }, { status: 400 });
    }

    const no = await createIllness({ kodePenyakit: kode, namaPenyakit });
    return NextResponse.json({ success: true, no });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
