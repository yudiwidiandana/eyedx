import { NextRequest, NextResponse } from "next/server";
import { registerUser, loginUser } from "@/app/lib/auth";

const MIN_PASSWORD_LENGTH = 8;
const ALLOWED_GENDERS = ["laki-laki", "perempuan", "lainnya"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password, confirmPassword, name, age, gender } = body;

    if (action === "register") {
      // age dicek terpisah supaya angka 0 tidak dianggap field kosong
      const hasAge = age !== undefined && age !== null && age !== "";
      if (!username || !password || !name || !hasAge || !gender) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      if (password !== confirmPassword) {
        return NextResponse.json(
          { error: "Password confirmation does not match" },
          { status: 400 }
        );
      }

      if (String(password).length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
          { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
          { status: 400 }
        );
      }

      const parsedAge = Number(age);
      if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 150) {
        return NextResponse.json({ error: "Invalid age" }, { status: 400 });
      }

      if (!ALLOWED_GENDERS.includes(gender)) {
        return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
      }

      const token = await registerUser({
        username,
        name,
        age: parsedAge,
        gender,
        password,
      });
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
