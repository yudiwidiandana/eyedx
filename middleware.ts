import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./app/lib/jwt";
import { locales, type Locale } from "./app/lib/translations";

// "/login" sekaligus mencakup "/login/register" lewat pencocokan prefix
const PUBLIC_PATHS = ["/", "/about", "/login"];

// buang prefix locale supaya /id/diagnosis diperlakukan sama dengan /diagnosis
function stripLocale(pathname: string): string {
  const segment = pathname.split("/")[1];
  if (!locales.includes(segment as Locale)) return pathname;
  return pathname.slice(segment.length + 1) || "/";
}

function localePrefix(pathname: string): string {
  const segment = pathname.split("/")[1];
  return locales.includes(segment as Locale) ? `/${segment}` : "";
}

function redirectToLogin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = new URL(`${localePrefix(pathname)}/login`, request.url);
  url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = stripLocale(pathname);

  const isPublicPath = PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || (publicPath !== "/" && path.startsWith(`${publicPath}/`))
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ||
                request.cookies.get("next-auth.session-token")?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return redirectToLogin(request);
  }

  if (path.startsWith("/admin") && payload.role !== "admin" && payload.role !== "expert") {
    return NextResponse.redirect(new URL(`${localePrefix(pathname)}/`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // .*\..* mengecualikan berkas ber-ekstensi di public/ agar tidak ikut diredirect
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
