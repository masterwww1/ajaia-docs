import { listUsers, readSessionUser } from "@/lib/auth";
import { asHttpError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await readSessionUser();
    return jsonOk({ user, users: listUsers() });
  } catch (error) {
    return asHttpError(error);
  }
}
