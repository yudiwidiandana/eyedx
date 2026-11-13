import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

type Payload = { sub: string; role: string };

// tanpa token 401, token rusak atau role tidak cocok 403
export async function requireRole(
  req: NextRequest,
  roles: string[]
): Promise<{ payload: Payload; error?: undefined } | { error: NextResponse; payload?: undefined }> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ||
                req.cookies.get("next-auth.session-token")?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const payload = await verifyToken(token);
  if (!payload || !roles.includes(payload.role)) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }

  return { payload };
}
