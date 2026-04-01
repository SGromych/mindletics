# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mindletics is a tablet-first web app for competitions where participants alternate between physical exercises and cognitive tests on a tablet. This is an MVP — keep everything simple.

The fixed event scenario has 8 stages: physical (1,3,5,7) and cognitive (2,4,6,8). All participants get the same tasks. There is no auth, no roles, no event constructor.

## Tech Stack

- **Next.js** (App Router) with TypeScript
- **Tailwind CSS**
- **Prisma** ORM + **PostgreSQL**
- **Polling** (every 2s) for live scoreboard — no WebSocket needed for MVP

## Build & Run Commands

```bash
npm install
npx prisma generate
npx prisma db push          # apply schema to DB
npx prisma db seed           # if seed script exists
npm run dev                  # start dev server
```

Environment: copy `.env.example` to `.env` and set `DATABASE_URL`.

## Architecture

### Routing (App Router)

- `/` — main navigation screen
- `/event/new` — create event (hall, name, date)
- `/participant/register` — register participant (name/nick, gender, age, event selection, bib number)
- `/attempt/[attemptId]` — participant flow screen (Start → stages → Finish/Abort)
- `/live/[eventId]` — live scoreboard (auto-refreshes via polling)
- `/leaderboards` — leaderboards with filters (gender, age, date)

### API Routes (`app/api/`)

- `events/` — CRUD for events
- `participants/` — register participant
- `attempts/start/`, `attempts/next-level/`, `attempts/abort/`, `attempts/[attemptId]/` — attempt lifecycle
- `live/[eventId]/` — live data for scoreboard
- `leaderboards/` — sorted results

### Data Model (Prisma)

Five entities: **Event**, **Participant**, **Attempt**, **StageResult**, **AnswerLog**. Attempt statuses: `registered`, `in_progress`, `finished`, `aborted`. See `05_PROJECT_STRUCTURE_FOR_CLAUDE.md` for full field list.

### Cognitive Tests

Four blocks, each with 5 tasks (tap-only, no text input):

| Block | Stage | Test Types |
|-------|-------|------------|
| Logic | 2 | number-series, figure-sequence, mini-matrix |
| Memory | 4 | memorise-objects, memorise-grid, memorise-sequence |
| Reaction | 6 | choice-reaction, go-no-go, stroop |
| Visual Final | 8 | target-search, pair-compare, visual-analogy |

Test data lives in `data/tests/*.json`. The fixed stage list is defined in `lib/stages.ts`.

### Key Libraries

- `lib/prisma.ts` — Prisma client singleton
- `lib/stages.ts` — fixed 8-stage scenario constant
- `lib/scoring.ts` — leaderboard sorting (more correct answers first, then less total time)
- `lib/test-engine.ts` — answer checking, scoring per cognitive block
- `components/tests/` — one component per cognitive block (LogicBlock, MemoryBlock, ReactionBlock, VisualFinalBlock)

## Critical Business Rules

- **Scoring**: sort by `total_correct` DESC, then `total_time_sec` ASC. Finished always ranks above Aborted.
- **Leaderboards**: overall, per-event, last event. Filterable by gender and age.
- **Raw answers**: every cognitive answer must be logged (task index, options shown, selected option, correct option, response_time_ms).
- **Abort**: always requires confirmation dialog.
- **Next Level**: must debounce/block for 1-2s to prevent double-tap.
- **Page refresh recovery**: attempt screen must restore current stage from DB by attempt ID.
- **Save progressively**: persist StageResult after each stage, not only at the end.
- **Event duration**: auto-closes after 1 hour.
- **Display name**: show nickname (not full name) on live scoreboard.
- **No images from files**: all visuals (figures, shapes) must be drawn programmatically (SVG/CSS/Canvas).

## UI Constraints

- **Tablet-first** (10-12 inch), primary orientation: **landscape**
- Buttons minimum 56px height, large touch targets
- 3-5 answer options max per question
- No dark mode, no complex animations
- Designed for use after physical exertion — must be obvious and finger-friendly

## Specification Documents

All requirements are in the numbered markdown files at the repo root:

- `01_CLAUDE_TASK.md` — full task description, business logic, screens, DB schema
- `02_IMPLEMENTATION_SCHEME.md` — architecture decisions, API design, project structure
- `03_OPEN_QUESTIONS_TEMPLATE.md` — answered design decisions (bib numbers, filters, statuses)
- `04_TEST_CATALOG_MVP.md` — detailed spec for all 12 cognitive test types with logging fields
- `05_PROJECT_STRUCTURE_FOR_CLAUDE.md` — expected file structure and Prisma entities
- `06_CLAUDE_SUBAGENTS_AND_HOOKS.md` — subagent roles and review hooks

## Custom Commands (Subagents)

Five slash commands in `.claude/commands/` for specialized review:

| Command | When to use |
|---------|-------------|
| `/architect` | Changes to project structure, Prisma schema, attempt flow, adding entities, before large refactors |
| `/frontend-ui` | New/changed screens, tablet UX issues, cognitive test components, layout/sizing |
| `/backend-data` | Prisma schema, API routes, scoring, attempt state transitions, answer logging |
| `/test-engine` | Cognitive test JSON format, new test types, answer checking, test block components |
| `/qa-review` | Before marking a task done — full checklist against requirements |

## Behavioral Checklists

### Before large changes
Before creating many files, refactoring multiple modules, changing Prisma schema, or rewriting attempt flow — first describe: what changes, which files affected, what risks, how to verify.

### Before schema changes
Before editing `schema.prisma`: describe why, list affected entities, which API routes and pages break, check seed compatibility.

### Before UI changes
Before changing participant screens, test UIs, or live scoreboard: verify tablet-friendliness, check button sizes, ensure Start/Next level/Abort are present, confirm tap-only interaction.

### Before test content changes
Before changing test JSON structure, test format, or answer engine: verify tap-only, 3-5 options, raw answers preserved, scoring intact.

### After significant changes
Brief self-review: what changed, what scenarios work now, what's untested, what risks remain.

### Before finishing a task
Checklist: project runs, schema current, README updated, env vars documented, UI tablet-friendly, live scoreboard works, leaderboards work, raw answers saved, Next level debounced, Abort confirmed.

## Language

The specification documents are in Russian. The codebase should use English for all code, variable names, comments, and API contracts.
