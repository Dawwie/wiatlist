import { sql, rows, maybeRow } from "@/lib/db";
import type { ListDetail, ListSummary } from "./types";

export function getListsForUser(userId: string): Promise<ListSummary[]> {
  return rows<ListSummary>(sql`
    SELECT l.id, l.name,
           (l.created_by = ${userId}) AS "isOwner",
           owner.name AS "ownerName",
           count(i.id) FILTER (WHERE i.deleted_at IS NULL AND NOT i.checked)::int AS "openItems"
    FROM lists l
    JOIN list_members m ON m.list_id = l.id AND m.user_id = ${userId}
    LEFT JOIN users owner ON owner.id = l.created_by
    LEFT JOIN items i ON i.list_id = l.id
    GROUP BY l.id, l.name, l.created_at, l.created_by, owner.name
    ORDER BY l.created_at DESC
  `);
}

// Joins `list_members`, so a non-member gets `undefined` — the access check and
// the fetch are the same round-trip.
export function getListForMember(
  userId: string,
  listId: string,
): Promise<ListDetail | undefined> {
  return maybeRow<ListDetail>(sql`
    SELECT l.id, l.name,
           (l.created_by = ${userId}) AS "isOwner",
           owner.name AS "ownerName"
    FROM lists l
    JOIN list_members m ON m.list_id = l.id AND m.user_id = ${userId}
    LEFT JOIN users owner ON owner.id = l.created_by
    WHERE l.id = ${listId}
  `);
}
