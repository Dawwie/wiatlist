# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Wiatlist — PWA shopping list shared by household members via invite links. Next.js 16 (App Router, Turbopack, TypeScript, Tailwind 4) on Vercel; Neon Postgres via `@neondatabase/serverless` (no ORM). Production: https://wiatlist.vercel.app

**Language convention**: all code, URL routes, identifiers, and DB names in English; user-visible UI copy in Polish.

## Commands

- `npm run dev` — dev server (falls back to another port if 3000 busy; reads `.env.development.local`)
- `npm run build` — production build (includes type-check); `npx tsc --noEmit` for types only
- `npm run db:init` — apply `schema.sql` to Neon (idempotent; uses `--env-file=.env.development.local`)
- `npx vercel env pull .env.development.local` — refresh `DATABASE_URL` (never commit env files)
- `npx vercel deploy --prod` — deploy (no GitHub auto-deploy from CLI; connected via dashboard)

No test suite. Verify changes E2E in the browser (two isolated browser contexts to simulate owner + invitee).

## Architecture

**No API routes.** All mutations are Server Actions in `lib/actions.ts` (~5–10 lines each: `requireUser()` → one `sql` statement → `revalidatePath()`). Reads happen directly in Server Components. "Realtime" is `app/components/refresh-poller.tsx` calling `router.refresh()` every 5s (paused when `document.hidden`).

**Auth** — no passwords/OAuth; two layers:
- `proxy.ts` (Next 16 rename of middleware.ts): cheap cookie-presence gate, no DB. Public paths: `/invite/*`, `/setup`, `/no-access`, manifest/sw/icons.
- `lib/auth.ts` `requireUser()`: real validation (session token → DB lookup, React `cache()`d per request). Must be called at the top of **every protected page and every Server Action** — proxy alone is spoofable.

Flow: first visitor to `/setup` (only when `users` is empty) becomes owner → generates multi-use 7-day invite links at `/invites` → invitee opens `/invite/[token]`, enters name, gets a user row + 1-year opaque session token in httpOnly cookie. Access is household-wide (every member sees every list); no per-list ACLs.

**Data** (`schema.sql`, applied by `scripts/init-db.mjs`): `users`, `sessions`, `invites`, `lists`, `items`. Items are **soft-deleted** (`deleted_at`) so `/stats` (GROUP BY over all item rows ever added) survives deletions — don't hard-DELETE items. Lists hard-delete and cascade their items.

**DB access**: `lib/db.ts` exports `sql` — lazily initialized on first call so builds don't require `DATABASE_URL` at import time. Neon driver speaks HTTP to Neon's proxy; it cannot connect to a plain local Postgres. Dev and prod share the same Neon database.

**PWA**: `app/manifest.ts` + minimal `public/sw.js` (network-first fetch handler, exists for installability) registered by `app/components/sw-register.tsx` in the root layout.

Dynamic route params are Promises (Next 16): `const { id } = await params`. `cookies()`/`headers()` are async.
