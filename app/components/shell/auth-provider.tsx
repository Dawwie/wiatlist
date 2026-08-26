"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { authClient } from "@/lib/neon-auth/client";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Soft-navigate within the auth flow (tab switches), but do a full page load
  // when leaving it (e.g. redirect to "/" after sign-in) so route-scoped auth-ui
  // CSS is torn down and global styles are reliably present on the next page.
  const softInAuth =
    (soft: (href: string) => void) => (href: string) =>
      href.startsWith("/auth") ? soft(href) : window.location.assign(href);
  // No onSessionChange: auth-ui calls it immediately before navigate(), and
  // router.refresh() can't be awaited. Its RSC request then races the navigation
  // — both hit the proxy's get-session, which rotates the session token on a
  // session_data cache miss (always the case just after sign-in). The loser sees
  // a consumed token, so the middleware redirects to /auth/sign-in and the user
  // lands back on the login form despite having signed in. The navigation that
  // follows re-fetches server content on its own, so the refresh was redundant.
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={softInAuth(router.push)}
      replace={softInAuth(router.replace)}
      Link={Link}
      social={{ providers: ["google"] }}
      defaultTheme="light"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
