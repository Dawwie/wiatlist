# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Wiatlist — PWA shopping list app. Each user owns private lists and shares individual lists via per-list invite links. Next.js 16 (App Router, Turbopack, TypeScript, Tailwind 4) on Vercel; Neon Postgres via `@neondatabase/serverless` (no ORM); UI on HeroUI v3. Production: https://wiatlist.vercel.app

**Language convention**: all code, URL routes, identifiers, and DB names in English; user-visible UI copy in Polish.

## Commands

- `npm run dev` — dev server (falls back to another port if 3000 busy; reads `.env.development.local`)
- `npm run build` — production build (includes type-check); `npx tsc --noEmit` for types only
- `npm run db:init` — apply `schema.sql` to Neon (idempotent; uses `--env-file=.env.development.local`)
- `npx vercel env pull .env.development.local` — refresh `DATABASE_URL` (never commit env files)
- `npx vercel deploy --prod` — deploy (no GitHub auto-deploy from CLI; connected via dashboard)
- `npm test` — vitest run (`npm run test:watch` to watch)

Vitest covers pure logic only (`lib/**/*.test.ts`, node environment). Everything else in `lib/` is `authorize → one SQL statement → revalidatePath()`, whose real interface is the database — mocking `sql` there would only restate the implementation. Verify those E2E in the browser, using two isolated browser contexts to simulate owner + invitee.

## Conventions that always apply

- Business logic lives in `lib/<domain>/`; routes and pages call domain functions and hold no SQL.
- Mutations are Server Actions, not API routes. The only custom route handlers are the Neon Auth handler (`app/api/auth/[...path]/route.ts`) and `app/api/lists/[id]/version/route.ts`.
- Authorization is **per-list**, never app-wide: `requireUser()` proves who, a per-list guard proves access.
- Next 16: dynamic route params are Promises (`const { id } = await params`); `cookies()` / `headers()` are async.

Area-specific conventions live in `.claude/rules/` (`domains`, `data-access`, `auth`, `ui`) and load when you touch the matching files. When a change makes one of those statements wrong, update the rule in the same commit.
