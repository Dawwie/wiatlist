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

**No custom API routes** besides the Neon Auth handler (`app/api/auth/[...path]/route.ts`). All mutations are Server Actions in `lib/actions.ts` (~5–10 lines each: `requireUser()` → one `sql` statement → `revalidatePath()`). Reads happen directly in Server Components. "Realtime" is `app/components/refresh-poller.tsx` calling `router.refresh()` every 5s (paused when `document.hidden`).

**Auth** — Neon Auth (Google OAuth + email/password via `@neondatabase/auth` + `@neondatabase/auth-ui`) authenticates; a separate `users` table membership row authorizes (invite-only gate). Two layers:
- `proxy.ts` (Next 16 rename of middleware.ts): `auth.middleware({ loginUrl: "/auth/sign-in" })` — requires a Neon Auth session, no DB hit. Excluded paths: `/api/auth/*`, `/auth/*`, `/no-access`, manifest/sw/icons.
- `lib/auth.ts` `requireUser()`: real authorization (Neon Auth session → `users` table membership lookup, React `cache()`d per request). Must be called at the top of **every protected page and every Server Action** — proxy alone only proves *who*, not *member*.

Flow: sign in via `/auth/sign-in` (Google or email/password, prebuilt Neon Auth UI) → first signed-in user when `users` is empty becomes owner via `/setup` → generates multi-use 7-day invite links at `/invites` → invitee signs in, opens `/invite/[token]`, confirms, gets a `users` row keyed to their Neon Auth id. Access is household-wide (every member sees every list); no per-list ACLs. Removing a member (`/invites`) deletes only the `users` row — their Neon Auth account still exists, so they land on `/no-access` until re-invited.

**Data** (`schema.sql`, applied by `scripts/init-db.mjs`): `users` (membership, FK to Neon Auth's `neon_auth."user"`), `invites`, `lists`, `items`. Auth accounts/sessions live in the `neon_auth` schema, managed by Neon Auth — not this app's schema. Items are **soft-deleted** (`deleted_at`) so `/stats` (GROUP BY over all item rows ever added) survives deletions — don't hard-DELETE items. Lists hard-delete and cascade their items.

**DB access**: `lib/db.ts` exports `sql` — lazily initialized on first call so builds don't require `DATABASE_URL` at import time. Neon driver speaks HTTP to Neon's proxy; it cannot connect to a plain local Postgres. Dev and prod share the same Neon database.

**PWA**: `app/manifest.ts` + minimal `public/sw.js` (network-first fetch handler, exists for installability) registered by `app/components/sw-register.tsx` in the root layout.

Dynamic route params are Promises (Next 16): `const { id } = await params`. `cookies()`/`headers()` are async.
