import { NextRequest, NextResponse } from "next/server";
import { registerUser, loginUser } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password, name } = body;

    if (action === "register") {
      if (!username || !password || !name) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const token = await registerUser(username, name, password);
      const response = NextResponse.json({ success: true, token });
      response.cookies.set("next-auth.session-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    if (action === "login") {
      if (!username || !password) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const token = await loginUser(username, password);
      const response = NextResponse.json({ success: true, token });
      response.cookies.set("next-auth.session-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete("next-auth.session-token");
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
