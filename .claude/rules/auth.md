---
paths:
  - "lib/users/**/*.ts"
  - "lib/lists/access.ts"
  - "lib/sharing/**/*.ts"
  - "lib/neon-auth/**/*.ts"
  - "proxy.ts"
  - "app/api/**/route.ts"
  - "app/auth/**"
  - "app/invite/**"
---

# Auth and authorization

Neon Auth (Google OAuth + email/password) authenticates. **Sign-up is open**: any authenticated Neon Auth user gets a `users` row auto-provisioned on first request. Authorization is **per-list**, not app-wide.

Two layers:

- `proxy.ts` (Next 16 rename of middleware.ts) requires a Neon Auth session, no DB hit. Server Action (`next-action`) and RSC (`rsc`) requests **must keep skipping it**: each middleware pass that misses Neon Auth's `session_data` cookie cache rotates the session token upstream, so two concurrent passes log the user out.
- `requireUser()` in the page or action is the real gate. `lib/lists/access.ts` enforces per-list authorization: `requireListAccess` / `requireListOwner` call `notFound()`; `hasListAccess` / `isListOwner` return booleans for the version route, which answers with status codes instead.

Every protected page and Server Action calls `requireUser()`; every list/item/sharing action also calls a per-list guard. The list page folds the check into the fetch — `getListForMember()` joins `list_members`, so a non-member gets `undefined`.

Access model: a list is visible and editable to its **members** (rows in `list_members`; the owner, `lists.created_by`, is inserted as a member on create). Members can edit items; **only the owner** can rename/delete the list and manage sharing.

Sharing flow: owner opens the Udostępnij modal on the list page -> `createInvite` mints a 7-day per-list token -> shares `/invite/[token]` -> recipient signs in, confirms, gets a `list_members` row (`acceptInvite`). Owner revokes links or removes members from the same modal (`revokeInvite` / `removeListMember`).

**Auth UI is not ours**: the sign-in/sign-up screens are Neon Auth's prebuilt `<AuthView>` (`@neondatabase/auth-ui`) and must stay as-is — don't restyle them with HeroUI.
