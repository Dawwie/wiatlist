import { cache } from "react";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";

export type User = { id: string; name: string };

export const getSessionUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  const rows = (await sql`
    SELECT u.id, u.name
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > now()
  `) as User[];
  return rows[0] ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/no-access");
  return user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, now() + interval '1 year')
  `;
  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
