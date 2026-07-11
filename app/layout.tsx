import type { Metadata, Viewport } from "next";
import { Figtree, Caprasimo } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Button } from "@heroui/react";
import { getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";
import SwRegister from "./components/sw-register";
import AuthProvider from "./components/auth-provider";
import Logo from "./components/logo";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
});

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Wiatlist",
  description: "Wspólna lista zakupów dla domowników",
  icons: { icon: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#2f8050",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  return (
    <html
      lang="pl"
      className={`light ${figtree.variable} ${caprasimo.variable} h-full bg-background antialiased`}
      data-theme="light"
      suppressHydrationWarning
    >
      <body className="mx-auto min-h-full w-full max-w-xl bg-background text-foreground">
        <AuthProvider>
          <SwRegister />
          {user && (
            <nav className="flex items-center gap-4 border-b border-border px-4 py-3 text-sm">
              <Logo />
              <Link href="/stats" className="text-muted hover:text-foreground">
                Statystyki
              </Link>
              <span
                title={user.name}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-sage-200 font-display text-foreground"
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Wyloguj
                </Button>
              </form>
            </nav>
          )}
          <main className="p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
