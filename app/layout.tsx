import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import SwRegister from "./components/sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wiatlist",
  description: "Wspólna lista zakupów dla domowników",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  return (
    <html lang="pl" className={`${geistSans.variable} h-full antialiased`}>
      <body className="mx-auto min-h-full w-full max-w-lg bg-white text-gray-900">
        <SwRegister />
        {user && (
          <nav className="flex items-center gap-4 border-b border-gray-200 px-4 py-3 text-sm">
            <Link href="/" className="font-bold text-green-700">
              Wiatlist
            </Link>
            <Link href="/stats" className="text-gray-600 hover:text-gray-900">
              Statystyki
            </Link>
            <Link href="/invites" className="text-gray-600 hover:text-gray-900">
              Zaproszenia
            </Link>
            <span className="ml-auto text-gray-400">{user.name}</span>
          </nav>
        )}
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
