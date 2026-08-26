---
paths:
  - "app/components/**/*.tsx"
  - "app/**/page.tsx"
  - "app/**/layout.tsx"
  - "app/globals.css"
  - "app/manifest.ts"
  - "public/sw.js"
---

# UI

HeroUI v3 (`@heroui/react` + `@heroui/styles`) on Tailwind v4 + React Aria. No `HeroUIProvider` and no JS `tailwind.config` — styles come from `@import "@heroui/styles"` after `@import "tailwindcss"` in `app/globals.css`. The app is light-only: `<html>` is pinned with `class="light" data-theme="light"`.

- Components are grouped by domain under `app/components/`. Shared primitives live in `ui/`, app shell (nav, logo, providers) in `shell/`.
- Client components import Server Actions directly rather than receiving them as props.
- Use `Button`, `Input`, `Select`, `SearchField` for app UI. Button intent: `variant="primary"` (CTA), `danger` (delete/revoke), `outline` (chips/copy), `ghost` (nav/edit).
- Mutations are uncontrolled `<form action={serverAction}>` submits, so **keep the `name` prop on fields** (React Aria emits the form value) and use `<Button type="submit">`.
- Use `onPress`, not `onClick`, for client handlers.
- Never `autoFocus` a field inside a modal — it focuses before React Aria patches focus, and iOS Safari then scrolls the fixed overlay off-screen when the keyboard opens. Use `useAutoFocus()` from `ui/autofocus.ts`, called from a component the dialog mounts.
- Auth screens are Neon Auth's `<AuthView>` — not HeroUI, leave them alone.
- "Realtime" is `refresh-poller.tsx` calling `router.refresh()` every 4s, paused when `document.hidden`.
- PWA: `app/manifest.ts` + a minimal `public/sw.js`. The worker's `fetch` listener **must never call `respondWith`** — the app has no offline story, and proxying every request through the worker only added a failure surface.
