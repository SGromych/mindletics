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
