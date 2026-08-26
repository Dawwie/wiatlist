import { notFound } from "next/navigation";
import { sql, maybeRow } from "@/lib/db";

// A list is visible/editable to its members (`list_members`, which includes the
// owner). Only the owner may rename/delete it or manage sharing.

export async function hasListAccess(userId: string, listId: string): Promise<boolean> {
  return Boolean(
    await maybeRow(sql`
      SELECT 1 FROM list_members WHERE list_id = ${listId} AND user_id = ${userId}
    `),
  );
}

export async function isListOwner(userId: string, listId: string): Promise<boolean> {
  return Boolean(
    await maybeRow(sql`
      SELECT 1 FROM lists WHERE id = ${listId} AND created_by = ${userId}
    `),
  );
}

export async function requireListAccess(userId: string, listId: string): Promise<void> {
  if (!(await hasListAccess(userId, listId))) notFound();
}

export async function requireListOwner(userId: string, listId: string): Promise<void> {
  if (!(await isListOwner(userId, listId))) notFound();
}
