import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./app/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/", "/login", "/login/register", "/diagnosis", "/questionnaire", "/about", "/results"];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`/${path}`));

  if (isPublicPath) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || 
                request.cookies.get("next-auth.session-token")?.value;

  if (!token) {
    if (pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (token) {
    const payload = await verifyToken(token);
    
    if (!payload) {
      if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    if (payload && pathname.startsWith("/admin")) {
      if (payload.role !== "admin" && payload.role !== "expert") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
