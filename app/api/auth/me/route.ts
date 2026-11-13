import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { getUserById } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  req.cookies.get("next-auth.session-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await getUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      age: user.age,
      gender: user.gender,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
