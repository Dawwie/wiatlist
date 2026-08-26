# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Wiatlist — PWA shopping list app. Each user owns private lists and shares individual lists with others via per-list invite links. Next.js 16 (App Router, Turbopack, TypeScript, Tailwind 4) on Vercel; Neon Postgres via `@neondatabase/serverless` (no ORM); UI on HeroUI v3. Production: https://wiatlist.vercel.app

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

**Auth** — Neon Auth (Google OAuth + email/password via `@neondatabase/auth` + `@neondatabase/auth-ui`) authenticates. **Sign-up is open**: any authenticated Neon Auth user gets a `users` row auto-provisioned on first request (`getSessionUser()` upserts). Authorization is **per-list**, not app-wide. Two layers:
- `proxy.ts` (Next 16 rename of middleware.ts): `auth.middleware({ loginUrl: "/auth/sign-in" })` — requires a Neon Auth session, no DB hit. Excluded paths: `/api/auth/*`, `/auth/*`, `/invite/*`, manifest/sw/icons. Server Action (`next-action`) and RSC (`rsc`) requests skip it: each middleware pass that misses Neon Auth's `session_data` cookie cache rotates the session token upstream, so two concurrent passes log the user out. `requireUser()` in the page/action is the real gate.
- `lib/auth.ts`: `requireUser()` (Neon Auth session → auto-provisioned `users` row, React `cache()`d per request) proves *who*; `requireListAccess(userId, listId)` / `requireListOwner(userId, listId)` enforce per-list authorization (`notFound()` on failure). Every protected page and Server Action calls `requireUser()`; every list/item action also calls a per-list guard.

Access model: a list is visible/editable to its **members** (rows in `list_members`; the owner — `lists.created_by` — is inserted as a member on create). Members can edit items; **only the owner** can rename/delete the list and manage sharing. Sharing flow: owner opens the **Udostępnij** modal (`app/components/share-button.tsx`) on the list page → `createInvite` mints a 7-day per-list token → shares `/invite/[token]` → recipient signs in, confirms, gets a `list_members` row for that list (`acceptInvite`). Owner revokes links or removes members from the same modal (`revokeInvite` / `removeListMember`).

**Data** (`schema.sql`, applied by `scripts/init-db.mjs`): `users` (auto-provisioned identity, FK to Neon Auth's `neon_auth."user"`), `list_members` (per-list access; PK `(list_id, user_id)`), `invites` (per-list share tokens, `list_id NOT NULL`), `lists`, `items`. Reads scope by `JOIN list_members m ON m.list_id = l.id AND m.user_id = ${user.id}` (home, list page suggestions, `/stats`, and the version API). Auth accounts/sessions live in the `neon_auth` schema, managed by Neon Auth — not this app's schema. Items are **soft-deleted** (`deleted_at`) so `/stats` survives deletions — don't hard-DELETE items. Lists hard-delete and cascade their items and `list_members`.

**DB access**: `lib/db.ts` exports `sql` — lazily initialized on first call so builds don't require `DATABASE_URL` at import time. Neon driver speaks HTTP to Neon's proxy; it cannot connect to a plain local Postgres. Dev and prod share the same Neon database.

**UI components** — HeroUI v3 (`@heroui/react` + `@heroui/styles`), built on Tailwind v4 + React Aria. No `HeroUIProvider` and no JS `tailwind.config`: styles come from `@import "@heroui/styles"` after `@import "tailwindcss"` in `app/globals.css`. App is light-only — `<html>` is pinned with `class="light" data-theme="light"`. Use `Button`, `Input`, `Select`, `SearchField` for app UI; the unit picker is the reusable `app/components/unit-select.tsx` wrapper over `Select`. Buttons map by intent: `variant="primary"` (CTA), `danger` (delete/revoke), `outline` (chips/copy), `ghost` (nav/edit). Because mutations are uncontrolled `<form action={serverAction}>` submits, keep the `name` prop on fields (React Aria emits the form value) and use `<Button type="submit">`; use `onPress` (not `onClick`) for client handlers. **Auth UI is NOT HeroUI** — the sign-in/sign-up/etc. screens are Neon Auth's prebuilt `<AuthView>` (`@neondatabase/auth-ui`) and must stay as-is.

**PWA**: `app/manifest.ts` + minimal `public/sw.js` (a no-op `fetch` listener for installability — it must never call `respondWith`; the app has no offline story, and proxying every request through the worker only added a failure surface) registered by `app/components/sw-register.tsx` in the root layout.

Dynamic route params are Promises (Next 16): `const { id } = await params`. `cookies()`/`headers()` are async.
