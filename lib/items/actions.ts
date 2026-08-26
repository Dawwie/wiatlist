"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/users";
import { requireListAccess } from "@/lib/lists";
import { parseQuantityUnit } from "./form";

// Every action re-derives the list from the form and re-checks membership: the
// client is not trusted, and `requireUser()` only proves who, not what.
async function authorize(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListAccess(user.id, listId);
  return { user, listId };
}

export async function addItem(formData: FormData) {
  const { user, listId } = await authorize(formData);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const { quantity, unit } = parseQuantityUnit(formData);
  await sql`
    INSERT INTO items (list_id, name, quantity, unit, created_by)
    VALUES (${listId}, ${name}, ${quantity}, ${unit}, ${user.id})
  `;
  revalidatePath(`/list/${listId}`);
}

export async function toggleItem(formData: FormData) {
  const { listId } = await authorize(formData);
  await sql`
    UPDATE items SET checked = NOT checked
    WHERE id = ${String(formData.get("id"))} AND list_id = ${listId}
  `;
  revalidatePath(`/list/${listId}`);
}

export async function updateItem(formData: FormData) {
  const { listId } = await authorize(formData);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const { quantity, unit } = parseQuantityUnit(formData);
  await sql`
    UPDATE items SET name = ${name}, quantity = ${quantity}, unit = ${unit}
    WHERE id = ${String(formData.get("id"))} AND list_id = ${listId}
  `;
  revalidatePath(`/list/${listId}`);
}

// Items are soft-deleted so /stats survives list clean-ups.
export async function deleteItem(formData: FormData) {
  const { listId } = await authorize(formData);
  await sql`
    UPDATE items SET deleted_at = now()
    WHERE id = ${String(formData.get("id"))} AND list_id = ${listId}
  `;
  revalidatePath(`/list/${listId}`);
}

export async function deleteAllItems(formData: FormData) {
  const { listId } = await authorize(formData);
  await sql`
    UPDATE items SET deleted_at = now()
    WHERE list_id = ${listId} AND deleted_at IS NULL
  `;
  revalidatePath(`/list/${listId}`);
}
