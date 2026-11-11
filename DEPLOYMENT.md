# Deployment

## Preferred path (Docker)

```bash
docker compose up --build -d
```

App listens on `http://localhost:3000`.

For a public URL, deploy the same container image to any host that supports Docker + a persistent volume for `/app/data` (Railway, Fly.io, Render, a VPS).

Required environment variables:

- `AUTH_SECRET` — long random string
- `DATABASE_PATH` — e.g. `/app/data/ajaia-docs.db`
- `PORT` — usually `3000`

## Live URL

**Status:** pending deploy from this environment  
**URL:** `TBD — replace after publishing`

Until the public URL is live, reviewers can run locally with `npm run dev` or `docker compose up --build`.

## Demo credentials

- `alice@ajaia.dev` / `password`
- `bob@ajaia.dev` / `password`
- `carol@ajaia.dev` / `password`

## Notes

This app uses SQLite on disk (`better-sqlite3`), so serverless hosts without a writable filesystem (classic Vercel) are a poor fit unless the database is moved to a remote provider. Docker + volume is the intentional deploy shape for this challenge.
