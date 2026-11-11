"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import type { DocumentDetail, ShareRole, User } from "@/lib/types";
import { AppShell } from "./AppShell";
import { RichTextEditor } from "./RichTextEditor";

type Props = {
  user: User;
  initialDocument: DocumentDetail;
  users: User[];
};

export function DocumentWorkspace({ user, initialDocument, users }: Props) {
  const router = useRouter();
  const [document, setDocument] = useState(initialDocument);
  const [title, setTitle] = useState(initialDocument.title);
  const [contentHtml, setContentHtml] = useState(initialDocument.contentHtml);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error" | "dirty">("saved");
  const [message, setMessage] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<ShareRole>("editor");
  const [sharing, setSharing] = useState(false);

  const canEdit = document.access === "owner" || document.access === "editor";
  const isOwner = document.access === "owner";

  const shareTargets = useMemo(
    () =>
      users.filter(
        (candidate) =>
          candidate.id !== user.id &&
          !document.shares.some((share) => share.userId === candidate.id)
      ),
    [users, user.id, document.shares]
  );

  useEffect(() => {
    setDocument(initialDocument);
    setTitle(initialDocument.title);
    setContentHtml(initialDocument.contentHtml);
    setSaveState("saved");
  }, [initialDocument]);

  useEffect(() => {
    if (!canEdit) return;
    if (title === document.title && contentHtml === document.contentHtml) {
      setSaveState((prev) => (prev === "saving" ? prev : "saved"));
      return;
    }

    setSaveState("dirty");
    const handle = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        const { document: next } = await api.updateDocument(document.id, {
          title,
          contentHtml,
        });
        setDocument(next);
        setSaveState("saved");
        setMessage(null);
      } catch (err) {
        setSaveState("error");
        setMessage(err instanceof Error ? err.message : "Save failed");
      }
    }, 650);

    return () => window.clearTimeout(handle);
  }, [title, contentHtml, canEdit, document.id, document.title, document.contentHtml]);

  async function onShare(event: React.FormEvent) {
    event.preventDefault();
    if (!shareEmail) return;
    setSharing(true);
    setMessage(null);
    try {
      const { document: next } = await api.shareDocument(document.id, shareEmail, shareRole);
      setDocument(next);
      setShareEmail("");
      setMessage(`Shared with ${shareEmail}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Share failed");
    } finally {
      setSharing(false);
    }
  }

  async function onRevoke(userId: string) {
    setSharing(true);
    setMessage(null);
    try {
      const { document: next } = await api.revokeShare(document.id, userId);
      setDocument(next);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not revoke access");
    } finally {
      setSharing(false);
    }
  }

  return (
    <AppShell user={user}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          ← All documents
        </Link>
        <div className="text-sm text-ink-soft">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "dirty" && "Unsaved changes"}
          {saveState === "error" && "Save failed"}
          {!canEdit && " · View only"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-2xl border border-line bg-paper-strong p-4 shadow-[var(--shadow)] sm:p-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canEdit}
            className="mb-4 w-full border-0 bg-transparent font-[family-name:var(--font-doc)] text-3xl text-ink outline-none placeholder:text-ink-soft/50 disabled:opacity-70 sm:text-4xl"
            placeholder="Untitled document"
            aria-label="Document title"
          />
          <RichTextEditor
            contentHtml={contentHtml}
            editable={canEdit}
            onChange={setContentHtml}
          />
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-paper-strong p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Access
            </h2>
            <p className="mt-2 text-sm text-ink">
              Owner: <strong>{document.ownerName}</strong>
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Your role:{" "}
              <strong className="text-ink">
                {document.access === "owner"
                  ? "Owner"
                  : document.access === "editor"
                    ? "Editor"
                    : "Viewer"}
              </strong>
            </p>

            {isOwner ? (
              <form onSubmit={onShare} className="mt-4 space-y-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-ink-soft">Share with</span>
                  <select
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2"
                    required
                  >
                    <option value="">Select a user…</option>
                    {shareTargets.map((candidate) => (
                      <option key={candidate.id} value={candidate.email}>
                        {candidate.name} ({candidate.email})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-ink-soft">Role</span>
                  <select
                    value={shareRole}
                    onChange={(e) => setShareRole(e.target.value as ShareRole)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={sharing || !shareEmail}
                  className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
                >
                  {sharing ? "Sharing…" : "Share"}
                </button>
              </form>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">
                Only the owner can manage sharing.
              </p>
            )}

            <ul className="mt-4 space-y-2">
              {document.shares.length === 0 ? (
                <li className="text-sm text-ink-soft">No collaborators yet.</li>
              ) : (
                document.shares.map((share) => (
                  <li
                    key={share.userId}
                    className="flex items-start justify-between gap-2 rounded-lg border border-line/80 px-2.5 py-2"
                  >
                    <div>
                      <div className="text-sm font-medium text-ink">{share.name}</div>
                      <div className="text-xs text-ink-soft">
                        {share.email} · {share.role}
                      </div>
                    </div>
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => onRevoke(share.userId)}
                        className="text-xs text-ink-soft hover:text-danger"
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </div>

          {message ? (
            <p className="rounded-xl border border-line bg-paper-strong px-3 py-2 text-sm text-ink-soft">
              {message}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => router.refresh()}
            className="w-full rounded-lg border border-line bg-paper-strong px-3 py-2 text-sm text-ink-soft hover:text-ink"
          >
            Refresh from server
          </button>
        </aside>
      </div>
    </AppShell>
  );
}
