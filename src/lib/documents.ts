import { getDb, newId } from "./db";
import type { DocumentDetail, DocumentSummary, ShareRole, User } from "./types";

export { escapeHtml, textToHtml } from "./html";


type DocRow = {
  id: string;
  title: string;
  content_html: string;
  owner_id: string;
  owner_name: string;
  created_at: string;
  updated_at: string;
};

function mapSummary(row: DocRow, access: DocumentSummary["access"]): DocumentSummary {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    access,
  };
}

export function listDocumentsForUser(userId: string): {
  owned: DocumentSummary[];
  shared: DocumentSummary[];
} {
  const db = getDb();

  const ownedRows = db
    .prepare(
      `SELECT d.id, d.title, d.content_html, d.owner_id, u.name as owner_name,
              d.created_at, d.updated_at
       FROM documents d
       JOIN users u ON u.id = d.owner_id
       WHERE d.owner_id = ?
       ORDER BY d.updated_at DESC`
    )
    .all(userId) as DocRow[];

  const sharedRows = db
    .prepare(
      `SELECT d.id, d.title, d.content_html, d.owner_id, u.name as owner_name,
              d.created_at, d.updated_at, s.role
       FROM document_shares s
       JOIN documents d ON d.id = s.document_id
       JOIN users u ON u.id = d.owner_id
       WHERE s.user_id = ?
       ORDER BY d.updated_at DESC`
    )
    .all(userId) as Array<DocRow & { role: ShareRole }>;

  return {
    owned: ownedRows.map((row) => mapSummary(row, "owner")),
    shared: sharedRows.map((row) => mapSummary(row, row.role)),
  };
}

function getAccess(
  documentId: string,
  userId: string
): { row: DocRow; access: DocumentSummary["access"] } | null {
  const db = getDb();
  const owned = db
    .prepare(
      `SELECT d.id, d.title, d.content_html, d.owner_id, u.name as owner_name,
              d.created_at, d.updated_at
       FROM documents d
       JOIN users u ON u.id = d.owner_id
       WHERE d.id = ? AND d.owner_id = ?`
    )
    .get(documentId, userId) as DocRow | undefined;

  if (owned) return { row: owned, access: "owner" };

  const shared = db
    .prepare(
      `SELECT d.id, d.title, d.content_html, d.owner_id, u.name as owner_name,
              d.created_at, d.updated_at, s.role
       FROM documents d
       JOIN users u ON u.id = d.owner_id
       JOIN document_shares s ON s.document_id = d.id
       WHERE d.id = ? AND s.user_id = ?`
    )
    .get(documentId, userId) as (DocRow & { role: ShareRole }) | undefined;

  if (!shared) return null;
  return { row: shared, access: shared.role };
}

export function getDocumentForUser(
  documentId: string,
  userId: string
): DocumentDetail | null {
  const accessInfo = getAccess(documentId, userId);
  if (!accessInfo) return null;

  const db = getDb();
  const shares = db
    .prepare(
      `SELECT s.user_id as userId, u.email, u.name, s.role
       FROM document_shares s
       JOIN users u ON u.id = s.user_id
       WHERE s.document_id = ?
       ORDER BY u.name ASC`
    )
    .all(documentId) as Array<{
    userId: string;
    email: string;
    name: string;
    role: ShareRole;
  }>;

  return {
    ...mapSummary(accessInfo.row, accessInfo.access),
    contentHtml: accessInfo.row.content_html,
    shares,
  };
}

export function createDocument(
  user: User,
  title = "Untitled document",
  contentHtml = "<p></p>"
): DocumentDetail {
  const db = getDb();
  const now = new Date().toISOString();
  const id = newId();

  db.prepare(
    `INSERT INTO documents (id, title, content_html, owner_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, title.trim() || "Untitled document", contentHtml, user.id, now, now);

  const doc = getDocumentForUser(id, user.id);
  if (!doc) throw new Error("Failed to create document");
  return doc;
}

export function updateDocument(
  documentId: string,
  userId: string,
  patch: { title?: string; contentHtml?: string }
): DocumentDetail | null {
  const accessInfo = getAccess(documentId, userId);
  if (!accessInfo) return null;
  if (accessInfo.access === "viewer") {
    throw new Response(JSON.stringify({ error: "Viewers cannot edit this document" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getDb();
  const nextTitle =
    patch.title !== undefined
      ? patch.title.trim() || "Untitled document"
      : accessInfo.row.title;
  const nextContent =
    patch.contentHtml !== undefined ? patch.contentHtml : accessInfo.row.content_html;
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE documents SET title = ?, content_html = ?, updated_at = ? WHERE id = ?`
  ).run(nextTitle, nextContent, now, documentId);

  return getDocumentForUser(documentId, userId);
}

export function deleteDocument(documentId: string, userId: string): boolean {
  const db = getDb();
  const result = db
    .prepare(`DELETE FROM documents WHERE id = ? AND owner_id = ?`)
    .run(documentId, userId);
  return result.changes > 0;
}

export function shareDocument(
  documentId: string,
  ownerId: string,
  targetEmail: string,
  role: ShareRole
): DocumentDetail | null {
  const db = getDb();
  const doc = db
    .prepare(`SELECT id FROM documents WHERE id = ? AND owner_id = ?`)
    .get(documentId, ownerId);
  if (!doc) return null;

  const target = db
    .prepare(`SELECT id FROM users WHERE lower(email) = lower(?)`)
    .get(targetEmail.trim()) as { id: string } | undefined;

  if (!target) {
    throw new Response(JSON.stringify({ error: "User not found. Use a seeded account email." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (target.id === ownerId) {
    throw new Response(JSON.stringify({ error: "You already own this document" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO document_shares (document_id, user_id, role, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(document_id, user_id) DO UPDATE SET role = excluded.role`
  ).run(documentId, target.id, role, now);

  db.prepare(`UPDATE documents SET updated_at = ? WHERE id = ?`).run(now, documentId);
  return getDocumentForUser(documentId, ownerId);
}

export function revokeShare(
  documentId: string,
  ownerId: string,
  targetUserId: string
): DocumentDetail | null {
  const db = getDb();
  const doc = db
    .prepare(`SELECT id FROM documents WHERE id = ? AND owner_id = ?`)
    .get(documentId, ownerId);
  if (!doc) return null;

  db.prepare(
    `DELETE FROM document_shares WHERE document_id = ? AND user_id = ?`
  ).run(documentId, targetUserId);

  return getDocumentForUser(documentId, ownerId);
}

