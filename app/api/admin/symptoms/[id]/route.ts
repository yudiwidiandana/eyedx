import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/requireRole";
import { updateSymptom, deleteSymptom } from "@/app/lib/db";
import { isValidSymptomCode } from "@/app/lib/symptomUtils";

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

    if (body.kodeGejala && !isValidSymptomCode(body.kodeGejala)) {
      return NextResponse.json(
        { error: "Symptom code must match the format G01-G39 (e.g. G07)" },
        { status: 400 }
      );
    }

    await updateSymptom(no, body);
    
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

    await deleteSymptom(no);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
