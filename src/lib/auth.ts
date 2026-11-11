import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDb, verifyPassword } from "./db";
import type { User } from "./types";

const COOKIE = "ajaia_session";
const secret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || "ajaia-docs-dev-secret-change-in-production"
  );

export async function createSessionToken(user: User) {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export async function readSessionFromRequest(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function authenticate(email: string, password: string): User | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, email, name, password_hash FROM users WHERE lower(email) = lower(?)`
    )
    .get(email.trim()) as
    | { id: string; email: string; name: string; password_hash: string }
    | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) return null;
  return { id: row.id, email: row.email, name: row.name };
}

export function listUsers(): User[] {
  const db = getDb();
  return db
    .prepare(`SELECT id, email, name FROM users ORDER BY name ASC`)
    .all() as User[];
}

export function requireUser(user: User | null): User {
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
