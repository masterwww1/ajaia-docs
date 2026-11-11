import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "ajaia_session";

async function hasSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(
        process.env.AUTH_SECRET || "ajaia-docs-dev-secret-change-in-production"
      )
    );
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await hasSession(req);

  if (pathname.startsWith("/login")) {
    if (authed) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!authed && (pathname === "/" || pathname.startsWith("/documents"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/documents/:path*"],
};
