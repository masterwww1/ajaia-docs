# AI workflow note

## Tools used

- **Cursor Agent (Composer)** for scaffolding, boilerplate, and iterating on the full-stack slice
- Manual browser/API verification and judgment on product scope

## Where AI materially sped things up

- Next.js project wiring, TipTap toolbar boilerplate, and API route scaffolding
- First-pass README / architecture prose that I then tightened for reviewer scanning
- Docker multi-stage setup for a Node + native `better-sqlite3` build

## What I changed or rejected from AI output

- Rejected a Prisma 7 setup after CLI/config churn burned time; switched to a thin SQLite data layer
- Rejected overbuilt auth (full registration, OAuth) in favor of seeded demo users
- Rejected “rebuild Google Docs” UI chrome (comments rail, tabs, plugins) to keep the first experience about writing + sharing
- Tightened autosave/share edge cases and HTML escaping for `.txt` import after review

## How I verified correctness

- `npm test` for import sanitization and share ACL behavior
- `npm run build` for type/compile confidence
- Manual flow: Alice creates/edits → shares with Bob/Carol → role checks → import sample Markdown → refresh persistence
- Explicit UI copy for supported upload types and demo credentials

AI accelerated mechanical work. Scope cuts, access rules, and what “done” meant for this timebox stayed human-owned.
