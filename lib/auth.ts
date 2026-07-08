import { cache } from "react";
import { redirect } from "next/navigation";
import { sql } from "./db";
import { auth } from "./neon-auth/server";

export type User = { id: string; name: string };

export const getSessionUser = cache(async (): Promise<User | null> => {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  const rows = (await sql`SELECT id, name FROM users WHERE id = ${session.user.id}`) as User[];
  return rows[0] ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/no-access");
  return user;
}
