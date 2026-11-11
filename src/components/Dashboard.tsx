"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/api-client";
import type { DocumentSummary, User } from "@/lib/types";
import { AppShell } from "./AppShell";

type Props = {
  user: User;
  owned: DocumentSummary[];
  shared: DocumentSummary[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function Dashboard({ user, owned, shared }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createDoc() {
    setBusy("create");
    setError(null);
    try {
      const { document } = await api.createDocument("Untitled document");
      router.push(`/documents/${document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create document");
    } finally {
      setBusy(null);
    }
  }

  async function onImport(file: File | undefined) {
    if (!file) return;
    setBusy("import");
    setError(null);
    try {
      const { document } = await api.importFile(file);
      router.push(`/documents/${document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeDoc(id: string) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setBusy(`delete:${id}`);
    setError(null);
    try {
      await api.deleteDocument(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell user={user}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-doc)] text-3xl text-ink sm:text-4xl">
            Your documents
          </h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Owned docs stay in your library. Shared docs appear separately with their access role.
            Import supports <strong>.txt</strong> and <strong>.md</strong> only (max 1MB).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={createDoc}
            disabled={busy !== null}
            className="rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper-strong hover:bg-ink/90 disabled:opacity-60"
          >
            {busy === "create" ? "Creating…" : "New document"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy !== null}
            className="rounded-lg border border-line bg-paper-strong px-4 py-2.5 text-sm font-medium text-ink hover:border-ink/30 disabled:opacity-60"
          >
            {busy === "import" ? "Importing…" : "Import .txt / .md"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.markdown,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-owned">Owned</h2>
        <DocumentList
          docs={owned}
          empty="No owned documents yet. Create one or import a file."
          onDelete={removeDoc}
          busyId={busy?.startsWith("delete:") ? busy.slice(7) : null}
        />
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--shared)]">
          Shared with you
        </h2>
        <DocumentList
          docs={shared}
          empty="Nothing shared with you yet. Ask Alice to share a document, or sign in as Bob/Carol."
        />
      </section>
    </AppShell>
  );
}

function DocumentList({
  docs,
  empty,
  onDelete,
  busyId,
}: {
  docs: DocumentSummary[];
  empty: string;
  onDelete?: (id: string) => void;
  busyId?: string | null;
}) {
  if (docs.length === 0) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-line bg-paper-strong/60 px-4 py-8 text-sm text-ink-soft">
        {empty}
      </p>
    );
  }

  return (
    <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper-strong">
      {docs.map((doc) => (
        <li key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-paper/70">
          <Link href={`/documents/${doc.id}`} className="min-w-0 flex-1">
            <div className="truncate font-medium text-ink">{doc.title}</div>
            <div className="mt-0.5 text-xs text-ink-soft">
              {doc.access === "owner"
                ? "Owner"
                : `${doc.access === "editor" ? "Can edit" : "Can view"} · from ${doc.ownerName}`}
              {" · "}
              Updated {formatDate(doc.updatedAt)}
            </div>
          </Link>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(doc.id)}
              disabled={busyId === doc.id}
              className="rounded-md px-2 py-1 text-xs text-ink-soft hover:bg-danger/10 hover:text-danger disabled:opacity-50"
            >
              {busyId === doc.id ? "…" : "Delete"}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
