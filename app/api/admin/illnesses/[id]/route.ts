import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/requireRole";
import { updateIllness, deleteIllness, getIllnesses } from "@/app/lib/db";
import { CORE_ILLNESS_CODES } from "@/app/lib/illnessCodes";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(req, ['admin']);
    if (error) return error;

    const { id } = await params;
    const no = parseInt(id);
    
    if (isNaN(no)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    // kode penyakit terikat ke kolom cf_pN di mesin CF, jadi tidak boleh diubah
    const target = (await getIllnesses()).find(i => i.no === no);
    if (target && body.kodePenyakit !== undefined && body.kodePenyakit.trim() !== target.kodePenyakit) {
      return NextResponse.json(
        { error: "Kode penyakit tidak dapat diubah karena terikat ke mesin CF, hanya nama yang bisa diedit" },
        { status: 400 }
      );
    }

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
    const { error } = await requireRole(req, ['admin']);
    if (error) return error;

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
