# Architecture note

## Product slice

I optimized for a coherent Google Docs–inspired slice, not feature parity:

1. **Editing quality** — TipTap with the formatting reviewers will actually try
2. **Persistence + reopen** — SQLite so refresh/restart behavior is real
3. **Sharing intent** — owner/editor/viewer with owned vs shared lists
4. **File import** — `.txt`/`.md` → new document (product-relevant, bounded)

Intentionally deprioritized: realtime multiplayer cursors, comments, version history, folders, `.docx` parsing, email invites, SSO, and mobile-native polish.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| App | Next.js App Router | One deployable full-stack unit |
| Editor | TipTap | Solid rich-text primitives without building a schema from scratch |
| Auth | Seeded users + JWT httpOnly cookie | Enough to demo sharing without building an IdP |
| DB | SQLite via `better-sqlite3` | Zero external services for local review; easy Docker volume |
| Import | `marked` for Markdown, escaped plain text for `.txt` | Safe and understandable |
| Tests | Vitest | Fast unit coverage for import sanitization + share ACL |

## Access model

- Document **owner** can edit, delete, share, and revoke
- **Editor** can rename/edit content, cannot manage shares or delete
- **Viewer** can open and read only
- Dashboard separates **Owned** and **Shared with you**

Autosave debounces PATCH requests (~650ms) so the editing flow feels continuous without a manual Save button.

## Tradeoffs

- **SQLite over hosted Postgres** for this timebox: fewer moving parts, free for reviewers, Docker-friendly. Not ideal for multi-region serverless without a remote SQL provider.
- **No CRDT/realtime sync**: last write via autosave wins. Good enough for a review demo; wrong for concurrent co-editing.
- **No `.docx`**: parsing Office formats is a time sink; Markdown/text import still proves the upload workflow.
- **Seeded auth**: reviewers can switch personas in seconds. Production would need invitations, password reset, and audit trails.

## What I’d build next (2–4 hours)

1. Presence + conflict-aware sync (or at least “someone else is editing” banners)
2. Attachment uploads linked to a document (images/PDF) in addition to import
3. Share links with optional role + revoke
4. Move persistence to Postgres/Turso for horizontal deploy targets
5. Playwright smoke test covering login → edit → share → second-user access
