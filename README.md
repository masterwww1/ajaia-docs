# Ajaia Docs

A lightweight collaborative document editor built for the AI-Native Full Stack Developer assignment.

## What works

- Create, rename, edit, autosave, and reopen rich-text documents
- Formatting: bold, italic, underline, H1–H3, bulleted/numbered lists
- Import `.txt` or `.md` files into new editable documents (max 1MB)
- Share documents with seeded users as **editor** or **viewer**
- Clear owned vs shared document lists
- SQLite persistence across refresh/restart
- Seeded demo auth (cookie session + JWT)

## Demo accounts

| Email | Password | Notes |
| --- | --- | --- |
| `alice@ajaia.dev` | `password` | Owns seeded docs |
| `bob@ajaia.dev` | `password` | Editor on “Q4 Product Notes” |
| `carol@ajaia.dev` | `password` | Viewer on “Q4 Product Notes” |

## Local setup

Requirements: Node.js 22+, npm

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful commands

```bash
npm test          # automated tests
npm run build     # production build
npm start         # run production build
npm run db:reset  # delete local SQLite DB (re-seeds on next boot)
```

### Docker

```bash
docker compose up --build
```

## Supported file import types

Only **`.txt`** and **`.md` / `.markdown`** are supported. Unsupported types and files over 1MB are rejected with a clear error in the UI.

A sample Markdown file is in `samples/meeting-notes.md`.

## Live deployment

See `DEPLOYMENT.md` and `SUBMISSION.md` for the live URL, credentials, and review notes.

## Project docs

- `ARCHITECTURE.md` — prioritization and technical choices
- `AI_WORKFLOW.md` — how AI tools were used
- `WALKTHROUGH_VIDEO.txt` — walkthrough video URL placeholder
- `SUBMISSION.md` — deliverables checklist
