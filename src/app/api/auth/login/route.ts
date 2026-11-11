import { authenticate, createSessionToken, setSessionCookie } from "@/lib/auth";
import { asHttpError, jsonError, jsonOk, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await readJson<{ email?: string; password?: string }>(req);
    if (!body?.email || !body?.password) {
      return jsonError("Email and password are required");
    }

    const user = authenticate(body.email, body.password);
    if (!user) return jsonError("Invalid email or password", 401);

    const token = await createSessionToken(user);
    const res = jsonOk({ user });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    return asHttpError(error);
  }
}
