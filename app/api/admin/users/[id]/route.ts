import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { getUserById } from "@/app/lib/db";
import mariadb, { type ConnectionConfig } from "mariadb";

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "eyedx",
  // servername diteruskan ke tls.connect() tapi absen dari tipe ssl driver
  ssl: process.env.DB_SSL === "true"
    ? ({ rejectUnauthorized: false, servername: process.env.DB_HOST } as ConnectionConfig["ssl"])
    : false,
  connectionLimit: 5,
});

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
    const { role } = body;

    if (!role || !['user', 'expert', 'admin'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    let conn = null;
    try {
      conn = await pool.getConnection();
      await conn.query(
        `UPDATE users SET role = ? WHERE id = ?`,
        [role, id]
      );

      const user = await getUserById(id);
      return NextResponse.json({ success: true, user });
    } finally {
      if (conn) conn.release();
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
