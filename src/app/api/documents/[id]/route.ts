import { readSessionUser, requireUser } from "@/lib/auth";
import { deleteDocument, getDocumentForUser, updateDocument } from "@/lib/documents";
import { asHttpError, jsonError, jsonOk, readJson } from "@/lib/http";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = requireUser(await readSessionUser());
    const { id } = await params;
    const document = getDocumentForUser(id, user.id);
    if (!document) return jsonError("Document not found", 404);
    return jsonOk({ document });
  } catch (error) {
    return asHttpError(error);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = requireUser(await readSessionUser());
    const { id } = await params;
    const body = await readJson<{ title?: string; contentHtml?: string }>(req);
    if (!body || (body.title === undefined && body.contentHtml === undefined)) {
      return jsonError("Provide title and/or contentHtml");
    }

    const document = updateDocument(id, user.id, body);
    if (!document) return jsonError("Document not found", 404);
    return jsonOk({ document });
  } catch (error) {
    return asHttpError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = requireUser(await readSessionUser());
    const { id } = await params;
    const deleted = deleteDocument(id, user.id);
    if (!deleted) {
      return jsonError("Document not found or you are not the owner", 404);
    }
    return jsonOk({ ok: true });
  } catch (error) {
    return asHttpError(error);
  }
}
