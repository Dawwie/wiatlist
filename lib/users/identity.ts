import { cache } from "react";
import { redirect } from "next/navigation";
import { sql, maybeRow } from "@/lib/db";
import { auth } from "@/lib/neon-auth/server";
import type { User } from "./types";

// Sign-up is open: any authenticated Neon Auth user gets a `users` row on first
// request. React `cache()` collapses the upsert to once per request.
export const getSessionUser = cache(async (): Promise<User | null> => {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  const name = session.user.name?.trim() || session.user.email;
  return (
    (await maybeRow<User>(sql`
      INSERT INTO users (id, name) VALUES (${session.user.id}, ${name})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `)) ?? null
  );
});

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}
