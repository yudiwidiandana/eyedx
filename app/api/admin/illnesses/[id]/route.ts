import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { updateIllness, deleteIllness, getIllnesses } from "@/app/lib/db";

// P1-P6 hardcoded di seluruh mesin CF (expertSystem.ts), jadi tidak boleh dihapus (T22)
const CORE_ILLNESS_CODES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const no = parseInt(id);
    
    if (isNaN(no)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    await updateIllness(no, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const no = parseInt(id);
    
    if (isNaN(no)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const illnesses = await getIllnesses();
    const target = illnesses.find(i => i.no === no);
    if (target && CORE_ILLNESS_CODES.includes(target.kodePenyakit)) {
      return NextResponse.json(
        { error: "Penyakit inti (P1-P6) tidak dapat dihapus karena sudah hardcoded di mesin CF" },
        { status: 400 }
      );
    }

    await deleteIllness(no);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
