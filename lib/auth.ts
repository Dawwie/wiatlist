import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { sql } from "./db";
import { auth } from "./neon-auth/server";

export type User = { id: string; name: string };

export const getSessionUser = cache(async (): Promise<User | null> => {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  const name = session.user.name?.trim() || session.user.email;
  const rows = (await sql`
    INSERT INTO users (id, name) VALUES (${session.user.id}, ${name})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, name
  `) as User[];
  return rows[0] ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

export async function requireListAccess(userId: string, listId: string): Promise<void> {
  const rows = (await sql`
    SELECT 1 FROM list_members WHERE list_id = ${listId} AND user_id = ${userId}
  `) as unknown[];
  if (!rows[0]) notFound();
}

export async function requireListOwner(userId: string, listId: string): Promise<void> {
  const rows = (await sql`
    SELECT 1 FROM lists WHERE id = ${listId} AND created_by = ${userId}
  `) as unknown[];
  if (!rows[0]) notFound();
}
