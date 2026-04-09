# MINDLETICS

Tablet-first web app for competitions combining physical exercises and cognitive tests.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL and configure `.env`:
```bash
cp .env.example .env
# Edit DATABASE_URL in .env
```

3. Push database schema:
```bash
npx prisma db push
```

4. Start dev server:
```bash
npm run dev
```

Open `http://localhost:3000` on your tablet browser.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL

## Event Flow

1. Create event at `/event/new`
2. Register participants at `/participant/register`
3. Participants go through 8 stages alternating physical & cognitive
4. Monitor progress at `/live/[eventId]`
5. View results at `/leaderboards`

## Deployment

Production runs on **Vercel** (Next.js hosting) + **Neon** (managed Postgres).
Domain: https://www.mindletics.ru

### Auto-deploy

Vercel is connected to this GitHub repository. Any push to `main` automatically
triggers a production build and deploy — no manual steps required for code
changes. Check status in the Vercel dashboard → Deployments tab.

### Updating the database schema

When `prisma/schema.prisma` changes, the code deploys automatically but Neon
is **not** updated — you must push the schema manually.

1. Install the Vercel CLI (once) and link the project:
   ```bash
   npx vercel login
   npx vercel link
   ```
2. Pull production env vars into a local file:
   ```bash
   npx vercel env pull .env.production.local --environment=production
   ```
   The file is gitignored via `.env*.local`.
3. Push the schema to Neon. Do **not** rely on `source` / `set -a` to load the
   env — the local `.env` (Docker URL) takes precedence and the pooler URL
   contains `&` which breaks shell sourcing. Extract the URL explicitly and
   pass it inline to Prisma:
   ```bash
   NEON_URL=$(node -e "const fs=require('fs');const line=fs.readFileSync('.env.production.local','utf8').split(/\r?\n/).find(l=>l.startsWith('DATABASE_URL='));console.log(line.slice('DATABASE_URL='.length).replace(/^\"|\"$/g,''))")
   DATABASE_URL="$NEON_URL" npx prisma db push
   ```
   Expected output: `Your database is now in sync with your Prisma schema.`
4. A local `EPERM … query_engine-windows.dll.node` at the end is harmless —
   it's the local Prisma Client regen failing because the dev server holds the
   DLL. Neon is already updated.

### Neon notes

- Vercel provides `DATABASE_URL` pointing at the Neon **pooler** endpoint
  (`...-pooler.c-2.eu-central-1.aws.neon.tech`). Prisma `db push` works against
  this pooler URL directly — no need to strip `-pooler` or get a separate
  direct URL.
- Free tier Neon compute auto-suspends when idle; the first request after a
  pause may take a second or two to wake it up.

### Rollback

Vercel keeps every previous deployment. To roll back: Deployments → click the
desired previous build → **Promote to Production**. Remember that rolling back
code does not roll back the Neon schema — handle schema migrations carefully.
