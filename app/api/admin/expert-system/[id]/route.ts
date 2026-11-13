import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/requireRole";
import { updateExpertSystemEntry, deleteExpertSystemEntry } from "@/app/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(req, ['admin', 'expert']);
    if (error) return error;

    const { id } = await params;
    const no = parseInt(id);
    
    if (isNaN(no)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    await updateExpertSystemEntry(no, body);
    
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
    const { error } = await requireRole(req, ['admin', 'expert']);
    if (error) return error;

    const { id } = await params;
    const no = parseInt(id);
    
    if (isNaN(no)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await deleteExpertSystemEntry(no);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
