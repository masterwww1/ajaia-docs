import { readSessionUser, requireUser } from "@/lib/auth";
import { createDocument, listDocumentsForUser } from "@/lib/documents";
import { asHttpError, jsonError, jsonOk, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = requireUser(await readSessionUser());
    return jsonOk(listDocumentsForUser(user.id));
  } catch (error) {
    return asHttpError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = requireUser(await readSessionUser());
    const body = await readJson<{ title?: string; contentHtml?: string }>(req);
    const doc = createDocument(user, body?.title, body?.contentHtml);
    return jsonOk({ document: doc }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON body");
    return asHttpError(error);
  }
}
