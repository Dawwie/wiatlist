import { sql, rows, row } from "@/lib/db";
import type { Item, ProductStat } from "./types";

export function getListItems(listId: string): Promise<Item[]> {
  return rows<Item>(sql`
    SELECT id, name, checked, quantity, unit
    FROM items
    WHERE list_id = ${listId} AND deleted_at IS NULL
    ORDER BY checked, created_at DESC
  `);
}

// Opaque change token for the list's items — the poller compares it verbatim.
export async function getListVersion(listId: string): Promise<string> {
  const { v } = await row<{ v: string }>(sql`
    SELECT (extract(epoch from coalesce(max(updated_at), to_timestamp(0))) * 1000)::bigint::text AS v
    FROM items WHERE list_id = ${listId}
  `);
  return v;
}

// Products the user has bought on any list they belong to, minus what this list
// already holds — the add-item combobox suggestions.
export async function getProductSuggestions(
  userId: string,
  listId: string,
): Promise<string[]> {
  const suggestions = await rows<{ product: string }>(sql`
    SELECT lower(trim(i.name)) AS product
    FROM items i
    JOIN list_members m ON m.list_id = i.list_id AND m.user_id = ${userId}
    GROUP BY 1
    HAVING lower(trim(i.name)) <> ALL (
      SELECT lower(trim(name)) FROM items
      WHERE list_id = ${listId} AND deleted_at IS NULL
    )
    ORDER BY count(*) DESC, max(i.created_at) DESC
    LIMIT 30
  `);
  return suggestions.map((s) => s.product);
}

// Soft-deleted items are counted too, so stats survive list clean-ups.
export function getPurchaseStats(userId: string, limit = 25): Promise<ProductStat[]> {
  return rows<ProductStat>(sql`
    SELECT lower(trim(i.name)) AS product,
           count(*)::int AS "timesAdded",
           max(i.created_at) AS "lastAdded"
    FROM items i
    JOIN list_members m ON m.list_id = i.list_id AND m.user_id = ${userId}
    GROUP BY 1
    ORDER BY 2 DESC, 3 DESC
    LIMIT ${limit}
  `);
}
