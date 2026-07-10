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
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={softInAuth(router.push)}
      replace={softInAuth(router.replace)}
      onSessionChange={router.refresh}
      Link={Link}
      social={{ providers: ["google"] }}
      defaultTheme="light"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
