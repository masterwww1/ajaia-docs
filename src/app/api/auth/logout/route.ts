import { clearSessionCookie } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  const res = jsonOk({ ok: true });
  clearSessionCookie(res);
  return res;
}
