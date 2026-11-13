# Deployment

## Live product URL

**https://doctor-object-carlos-indicates.trycloudflare.com**

Demo accounts:

- `alice@ajaia.dev` / `password` (owner of seeded docs)
- `bob@ajaia.dev` / `password` (editor on “Q4 Product Notes”)
- `carol@ajaia.dev` / `password` (viewer on “Q4 Product Notes”)

Source: https://github.com/masterwww1/ajaia-docs

> Note: the Cloudflare quick tunnel is served from the review environment while that process is running. For a durable host, use the Docker path below on Railway, Fly.io, Render, or any VPS with a persistent volume.

## Preferred durable path (Docker)

```bash
docker compose up --build -d
```

App listens on `http://localhost:3000`.

Required environment variables:

- `AUTH_SECRET` — long random string
- `DATABASE_PATH` — e.g. `/app/data/ajaia-docs.db`
- `PORT` — usually `3000`

## Local without Docker

```bash
cp .env.example .env
npm install
npm run dev
```

## Why Docker / long-running Node

This app uses SQLite on disk (`better-sqlite3`). Classic serverless hosts without a writable filesystem are a poor fit unless the database is moved to a remote SQL provider. Docker + volume is the intentional production shape for this challenge.
