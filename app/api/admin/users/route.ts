import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { hashPassword } from "@/app/lib/auth";
import { getUsers, getUserByUsername, createUser } from "@/app/lib/db";
import { validateNewUser, isValidRole } from "@/app/lib/userValidation";

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ||
                req.cookies.get("next-auth.session-token")?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return { error: NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 }) };
  }

  return { payload };
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const body = await req.json();
    const { username, name, age, gender, password, confirmPassword, role } = body;

    const invalid = validateNewUser({ username, name, age, gender, password, confirmPassword });
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const id = await createUser({
      username,
      name,
      age: Number(age),
      gender,
      passwordHash,
      role,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
