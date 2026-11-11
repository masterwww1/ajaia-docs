import { readSessionUser, requireUser } from "@/lib/auth";
import { revokeShare } from "@/lib/documents";
import { asHttpError, jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = requireUser(await readSessionUser());
    const { id, userId } = await params;
    const document = revokeShare(id, user.id, userId);
    if (!document) {
      return jsonError("Only the owner can manage sharing", 403);
    }
    return jsonOk({ document });
  } catch (error) {
    return asHttpError(error);
  }
}
