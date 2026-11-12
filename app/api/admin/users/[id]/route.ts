import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { hashPassword } from "@/app/lib/auth";
import { getUserById, updateUser } from "@/app/lib/db";
import { validateUserUpdate, isValidRole } from "@/app/lib/userValidation";

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
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, age, gender, password, confirmPassword, role } = body;

    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // cegah admin terakhir mengunci dirinya sendiri keluar dari panel
    if (id === payload.sub && role !== 'admin') {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const invalid = validateUserUpdate({ name, age, gender, password, confirmPassword });
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const passwordHash = password ? await hashPassword(password) : undefined;

    await updateUser(id, {
      name,
      age: age === undefined ? undefined : Number(age),
      gender,
      passwordHash,
      role,
    });

    const updated = await getUserById(id);
    // password_hash tidak boleh ikut terkirim ke klien
    const user = updated ? { ...updated, passwordHash: undefined } : null;
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
