import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("document sharing access", () => {
  let tempDir: string;
  let previousDbPath: string | undefined;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ajaia-docs-"));
    previousDbPath = process.env.DATABASE_PATH;
    process.env.DATABASE_PATH = path.join(tempDir, "test.db");

    // Reset the module-level SQLite singleton between tests.
    const globalForDb = globalThis as unknown as { __ajaiaDb?: unknown };
    if (globalForDb.__ajaiaDb && typeof (globalForDb.__ajaiaDb as { close?: () => void }).close === "function") {
      (globalForDb.__ajaiaDb as { close: () => void }).close();
    }
    globalForDb.__ajaiaDb = undefined;
  });

  afterEach(() => {
    const globalForDb = globalThis as unknown as { __ajaiaDb?: { close?: () => void } };
    globalForDb.__ajaiaDb?.close?.();
    globalForDb.__ajaiaDb = undefined;

    if (previousDbPath === undefined) delete process.env.DATABASE_PATH;
    else process.env.DATABASE_PATH = previousDbPath;

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("lets owners grant editor access and prevents viewers from editing", async () => {
    const { listUsers } = await import("./auth");
    const {
      createDocument,
      getDocumentForUser,
      shareDocument,
      updateDocument,
    } = await import("./documents");

    const users = listUsers();
    const alice = users.find((u) => u.email === "alice@ajaia.dev");
    const bob = users.find((u) => u.email === "bob@ajaia.dev");
    const carol = users.find((u) => u.email === "carol@ajaia.dev");
    expect(alice && bob && carol).toBeTruthy();

    const doc = createDocument(alice!, "Access test", "<p>hello</p>");
    shareDocument(doc.id, alice!.id, bob!.email, "editor");
    shareDocument(doc.id, alice!.id, carol!.email, "viewer");

    const bobView = getDocumentForUser(doc.id, bob!.id);
    const carolView = getDocumentForUser(doc.id, carol!.id);
    expect(bobView?.access).toBe("editor");
    expect(carolView?.access).toBe("viewer");

    const edited = updateDocument(doc.id, bob!.id, { contentHtml: "<p>from bob</p>" });
    expect(edited?.contentHtml).toContain("from bob");

    expect(() => updateDocument(doc.id, carol!.id, { contentHtml: "<p>nope</p>" })).toThrow(
      Response
    );
  });
});
