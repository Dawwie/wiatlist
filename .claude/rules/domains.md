---
paths:
  - "lib/**/*.ts"
  - "app/**/route.ts"
  - "app/**/page.tsx"
---

# Domain modules

`lib/<domain>/` owns everything about one concept: `queries.ts` (reads), `actions.ts` (`"use server"` mutations), `types.ts` (row shapes), plus `access.ts` where the domain has authorization rules. `index.ts` re-exports the public surface.

- Import the public surface — `@/lib/lists`, never a file inside it.
- Import Server Actions from `@/lib/<domain>/actions` directly: a `"use server"` boundary can't be re-exported through `index.ts`.
- **Routes hold no SQL.** Pages and route handlers call domain functions and render; every query lives in a domain `queries.ts`.
- Alias columns to camelCase in SQL (`AS "isOwner"`) instead of adding a mapping layer.
- Mutations are Server Actions, ~5-10 lines each: authorize -> one `sql` statement -> `revalidatePath()`. Reads happen directly in Server Components. Don't add API routes for either.
