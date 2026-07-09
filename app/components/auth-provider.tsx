"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { authClient } from "@/lib/neon-auth/client";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={router.refresh}
      Link={Link}
      social={{ providers: ["google"] }}
      defaultTheme="light"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
