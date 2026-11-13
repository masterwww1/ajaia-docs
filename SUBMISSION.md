# Submission checklist

## Included in this folder / repo

- [x] Source code (`src/`, config, Docker)
- [x] `README.md` — local setup and run instructions
- [x] `ARCHITECTURE.md` — prioritization and design tradeoffs
- [x] `AI_WORKFLOW.md` — AI usage note
- [x] `SUBMISSION.md` — this file
- [x] `DEPLOYMENT.md` — live URL + deploy notes
- [x] `WALKTHROUGH_VIDEO.txt` — walkthrough video URL
- [x] `samples/meeting-notes.md` — import demo file
- [x] Automated tests (`npm test`)
- [x] Screenshots in `screenshots/` (dashboard + editor)

## Live product

- **URL:** https://doctor-object-carlos-indicates.trycloudflare.com
- **Source:** https://github.com/masterwww1/ajaia-docs
- **Demo login:** `alice@ajaia.dev` / `password`
- **Sharing demo:** also try `bob@ajaia.dev` and `carol@ajaia.dev` / `password`
- **Details:** `DEPLOYMENT.md`

## Working

- Document create / rename / rich-text edit / autosave / reopen
- Owned vs shared lists
- Share as editor or viewer; revoke access
- Viewer cannot edit; editor can edit; owner manages sharing
- Import `.txt` and `.md` into a new document
- SQLite persistence
- Docker Compose deploy path

## Incomplete / intentionally out of scope

- Realtime collaborative cursors and conflict-free merging
- `.docx` import
- Email/link-based invites
- Comments, suggestions, version history
- Production-grade auth (reset, MFA, org admin)

## Next with another 2–4 hours

- Realtime or presence layer
- Document attachments
- Shareable links
- Hosted SQL for serverless deploy
- End-to-end Playwright coverage

## Google Drive packet

Upload this repository (zip or clone contents) plus:

1. Live URL (from `DEPLOYMENT.md`)
2. Walkthrough video URL (from `WALKTHROUGH_VIDEO.txt`)
3. Optional screenshots of login, editor, and sharing panels
