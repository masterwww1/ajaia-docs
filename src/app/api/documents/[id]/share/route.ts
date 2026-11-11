import { readSessionUser, requireUser } from "@/lib/auth";
import { shareDocument } from "@/lib/documents";
import { asHttpError, jsonError, jsonOk, readJson } from "@/lib/http";
import type { ShareRole } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const user = requireUser(await readSessionUser());
    const { id } = await params;
    const body = await readJson<{ email?: string; role?: ShareRole }>(req);

    if (!body?.email) return jsonError("Email is required");
    const role = body.role === "viewer" ? "viewer" : "editor";

    const document = shareDocument(id, user.id, body.email, role);
    if (!document) {
      return jsonError("Only the owner can share this document", 403);
    }
    return jsonOk({ document });
  } catch (error) {
    return asHttpError(error);
  }
}
