import { readSessionUser, requireUser } from "@/lib/auth";
import { createDocument, textToHtml } from "@/lib/documents";
import { asHttpError, jsonError, jsonOk } from "@/lib/http";
import { marked } from "marked";

export const runtime = "nodejs";

const MAX_BYTES = 1_000_000;

function titleFromFilename(filename: string) {
  return filename.replace(/\.(txt|md|markdown)$/i, "").trim() || "Imported document";
}

export async function POST(req: Request) {
  try {
    const user = requireUser(await readSessionUser());
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return jsonError("Choose a .txt or .md file to import");
    }

    if (file.size > MAX_BYTES) {
      return jsonError("File is too large. Max size is 1MB.");
    }

    const name = file.name || "import.txt";
    const lower = name.toLowerCase();
    const isTxt = lower.endsWith(".txt");
    const isMd = lower.endsWith(".md") || lower.endsWith(".markdown");

    if (!isTxt && !isMd) {
      return jsonError("Unsupported file type. Upload a .txt or .md file.");
    }

    const text = await file.text();
    let contentHtml: string;

    if (isMd) {
      contentHtml = await marked.parse(text, { breaks: true, gfm: true });
      if (!contentHtml.trim()) contentHtml = "<p></p>";
    } else {
      contentHtml = textToHtml(text);
    }

    const document = createDocument(user, titleFromFilename(name), contentHtml);
    return jsonOk({ document }, { status: 201 });
  } catch (error) {
    return asHttpError(error);
  }
}
