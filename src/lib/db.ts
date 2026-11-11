import Database from "better-sqlite3";
import { createHash, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";

const dbPath =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "ajaia-docs.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const globalForDb = globalThis as unknown as {
  __ajaiaDb?: Database.Database;
};

function createDb() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_shares (
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('viewer', 'editor')),
      created_at TEXT NOT NULL,
      PRIMARY KEY (document_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
    CREATE INDEX IF NOT EXISTS idx_shares_user ON document_shares(user_id);
  `);

  seedIfEmpty(db);
  return db;
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function passwordRecord(password: string) {
  const salt = createHash("sha256").update(password + ":ajaia").digest("hex").slice(0, 16);
  return `${salt}:${hashPassword(password, salt)}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = Buffer.from(hashPassword(password, salt), "hex");
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (count.c > 0) return;

  const now = new Date().toISOString();
  const insertUser = db.prepare(
    `INSERT INTO users (id, email, name, password_hash, created_at)
     VALUES (@id, @email, @name, @password_hash, @created_at)`
  );
  const insertDoc = db.prepare(
    `INSERT INTO documents (id, title, content_html, owner_id, created_at, updated_at)
     VALUES (@id, @title, @content_html, @owner_id, @created_at, @updated_at)`
  );
  const insertShare = db.prepare(
    `INSERT INTO document_shares (document_id, user_id, role, created_at)
     VALUES (@document_id, @user_id, @role, @created_at)`
  );

  const alice = randomUUID();
  const bob = randomUUID();
  const carol = randomUUID();
  const welcomeDoc = randomUUID();
  const sharedDoc = randomUUID();

  const seed = db.transaction(() => {
    insertUser.run({
      id: alice,
      email: "alice@ajaia.dev",
      name: "Alice Chen",
      password_hash: passwordRecord("password"),
      created_at: now,
    });
    insertUser.run({
      id: bob,
      email: "bob@ajaia.dev",
      name: "Bob Rivera",
      password_hash: passwordRecord("password"),
      created_at: now,
    });
    insertUser.run({
      id: carol,
      email: "carol@ajaia.dev",
      name: "Carol Okonkwo",
      password_hash: passwordRecord("password"),
      created_at: now,
    });

    insertDoc.run({
      id: welcomeDoc,
      title: "Welcome to Ajaia Docs",
      content_html: `<h1>Welcome to Ajaia Docs</h1><p>This is a lightweight collaborative editor for the Ajaia coding challenge.</p><ul><li><strong>Create</strong> and rename documents</li><li><em>Format</em> with bold, italic, underline, headings, and lists</li><li>Import <u>.txt</u> or <u>.md</u> files</li><li>Share with teammates</li></ul><p>Sign in as Alice, Bob, or Carol (password: <code>password</code>) to try sharing.</p>`,
      owner_id: alice,
      created_at: now,
      updated_at: now,
    });

    insertDoc.run({
      id: sharedDoc,
      title: "Q4 Product Notes",
      content_html: `<h2>Q4 Product Notes</h2><p>Draft shared with the team. Edit freely if you have editor access.</p><ol><li>Ship document creation and editing</li><li>Add import and sharing</li><li>Deploy a reviewable build</li></ol>`,
      owner_id: alice,
      created_at: now,
      updated_at: now,
    });

    insertShare.run({
      document_id: sharedDoc,
      user_id: bob,
      role: "editor",
      created_at: now,
    });
    insertShare.run({
      document_id: sharedDoc,
      user_id: carol,
      role: "viewer",
      created_at: now,
    });
  });

  seed();
}

export function getDb() {
  if (!globalForDb.__ajaiaDb) {
    globalForDb.__ajaiaDb = createDb();
  }
  return globalForDb.__ajaiaDb;
}

export function newId() {
  return randomUUID();
}
