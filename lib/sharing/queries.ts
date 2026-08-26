import { headers } from "next/headers";
import { sql, rows, maybeRow } from "@/lib/db";
import type { InvitedList, ListMember, ShareLink, ShareState } from "./types";

async function requestOrigin(): Promise<string> {
  const host = (await headers()).get("host") ?? "localhost:3000";
  return `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
}

// Everything the owner's share modal needs: live invite links (absolute URLs,
// ready to copy) and the people who already have access.
export async function getShareState(listId: string): Promise<ShareState> {
  const [origin, links, members] = await Promise.all([
    requestOrigin(),
    rows<{ token: string; expires_at: string }>(sql`
      SELECT token, expires_at FROM invites
      WHERE list_id = ${listId} AND expires_at > now()
      ORDER BY created_at DESC
    `),
    rows<ListMember>(sql`
      SELECT u.id, u.name, au.email
      FROM list_members lm
      JOIN users u ON u.id = lm.user_id
      JOIN neon_auth."user" au ON au.id = u.id
      WHERE lm.list_id = ${listId}
      ORDER BY lm.created_at
    `),
  ]);
  return {
    links: links.map<ShareLink>((link) => ({
      token: link.token,
      url: `${origin}/invite/${link.token}`,
      expiresAt: link.expires_at,
    })),
    members,
  };
}

// Resolves an unexpired share token to the list it grants access to.
export function getInvitedList(token: string): Promise<InvitedList | undefined> {
  return maybeRow<InvitedList>(sql`
    SELECT i.list_id AS "listId", l.name
    FROM invites i
    JOIN lists l ON l.id = i.list_id
    WHERE i.token = ${token} AND i.expires_at > now()
  `);
}
