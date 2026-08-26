---
paths:
  - "lib/db/**/*.ts"
  - "schema.sql"
  - "scripts/*.mjs"
---

# Data access

- `lib/db/client.ts` exports `sql`, lazily initialized on first call so builds don't require `DATABASE_URL` at import time.
- The Neon driver speaks HTTP to Neon's proxy; **it cannot connect to a plain local Postgres**. Dev and prod share the same Neon database — a destructive statement in dev hits production data.
- Use the `rows<T>` / `row<T>` / `maybeRow<T>` wrappers instead of casting: the driver returns `unknown[]`, and the wrappers put the row type in one place per call site and make "exactly one row" vs "at most one" explicit.
- `schema.sql` holds canonical `CREATE TABLE`s only — no migration history. It must stay idempotent, since `npm run db:init` re-applies it.
- Reads scope by membership: `JOIN list_members m ON m.list_id = l.id AND m.user_id = ${user.id}`.
- Items are **soft-deleted** (`deleted_at`) so `/stats` survives deletions — never hard-`DELETE` an item. Lists hard-delete and cascade their items and `list_members`.
- Auth accounts and sessions live in the `neon_auth` schema, managed by Neon Auth. Don't add them to `schema.sql`.
