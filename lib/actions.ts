"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "./db";
import { requireUser, requireListAccess, requireListOwner } from "./auth";
import { auth } from "./neon-auth/server";
import { UNITS, DEFAULT_UNIT } from "./units";

function parseQuantityUnit(formData: FormData) {
  const qtyRaw = String(formData.get("quantity") ?? "").trim();
  let quantity: number | null = qtyRaw === "" ? null : Number(qtyRaw);
  if (quantity !== null && (Number.isNaN(quantity) || quantity < 0)) quantity = null;
  const unitRaw = String(formData.get("unit") ?? "");
  const unit = (UNITS as readonly string[]).includes(unitRaw) ? unitRaw : DEFAULT_UNIT;
  return { quantity, unit };
}

// --- session ---

export async function signOutAction() {
  await auth.signOut();
  redirect("/auth/sign-in");
}

// --- sharing (per-list invite links) ---

export async function createInvite(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListOwner(user.id, listId);
  const token = randomBytes(32).toString("base64url");
  await sql`
    INSERT INTO invites (token, list_id, created_by, expires_at)
    VALUES (${token}, ${listId}, ${user.id}, now() + interval '7 days')
  `;
  revalidatePath(`/list/${listId}`);
}

export async function revokeInvite(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListOwner(user.id, listId);
  await sql`DELETE FROM invites WHERE token = ${String(formData.get("token"))} AND list_id = ${listId}`;
  revalidatePath(`/list/${listId}`);
}

export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect(`/auth/sign-in?redirectTo=/invite/${token}`);
  const [invite] = (await sql`
    SELECT list_id FROM invites WHERE token = ${token} AND expires_at > now()
  `) as [{ list_id: string } | undefined];
  if (!invite) redirect(`/invite/${token}`);
  const name = session.user.name?.trim() || session.user.email;
  await sql`INSERT INTO users (id, name) VALUES (${session.user.id}, ${name}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`;
  await sql`INSERT INTO list_members (list_id, user_id) VALUES (${invite.list_id}, ${session.user.id}) ON CONFLICT DO NOTHING`;
  redirect(`/list/${invite.list_id}`);
}

export async function removeListMember(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  const memberId = String(formData.get("userId"));
  await requireListOwner(user.id, listId);
  if (memberId !== user.id) {
    await sql`DELETE FROM list_members WHERE list_id = ${listId} AND user_id = ${memberId}`;
  }
  revalidatePath(`/list/${listId}`);
}

// --- lists ---

export async function createList(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const [list] = (await sql`
    INSERT INTO lists (name, created_by) VALUES (${name}, ${user.id}) RETURNING id
  `) as [{ id: string }];
  await sql`INSERT INTO list_members (list_id, user_id) VALUES (${list.id}, ${user.id})`;
  revalidatePath("/");
}

export async function renameList(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await requireListOwner(user.id, id);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await sql`UPDATE lists SET name = ${name} WHERE id = ${id}`;
  revalidatePath("/");
}

export async function deleteList(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await requireListOwner(user.id, id);
  await sql`DELETE FROM lists WHERE id = ${id}`;
  revalidatePath("/");
}

// --- items ---

export async function addItem(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListAccess(user.id, listId);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const { quantity, unit } = parseQuantityUnit(formData);
  await sql`INSERT INTO items (list_id, name, quantity, unit, created_by) VALUES (${listId}, ${name}, ${quantity}, ${unit}, ${user.id})`;
  revalidatePath(`/list/${listId}`);
}

export async function toggleItem(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListAccess(user.id, listId);
  await sql`UPDATE items SET checked = NOT checked WHERE id = ${String(formData.get("id"))} AND list_id = ${listId}`;
  revalidatePath(`/list/${listId}`);
}

export async function updateItem(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListAccess(user.id, listId);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const { quantity, unit } = parseQuantityUnit(formData);
  await sql`UPDATE items SET name = ${name}, quantity = ${quantity}, unit = ${unit} WHERE id = ${String(formData.get("id"))} AND list_id = ${listId}`;
  revalidatePath(`/list/${listId}`);
}

export async function deleteItem(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListAccess(user.id, listId);
  await sql`UPDATE items SET deleted_at = now() WHERE id = ${String(formData.get("id"))} AND list_id = ${listId}`;
  revalidatePath(`/list/${listId}`);
}

export async function deleteAllItems(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListAccess(user.id, listId);
  await sql`UPDATE items SET deleted_at = now() WHERE list_id = ${listId} AND deleted_at IS NULL`;
  revalidatePath(`/list/${listId}`);
}
