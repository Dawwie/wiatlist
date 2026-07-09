"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "./db";
import { requireUser } from "./auth";
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

// --- bootstrap ---

export async function setupOwner() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");
  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM users`) as [{ count: number }];
  if (count > 0) redirect("/");
  const name = session.user.name?.trim() || session.user.email;
  await sql`INSERT INTO users (id, name) VALUES (${session.user.id}, ${name}) ON CONFLICT (id) DO NOTHING`;
  redirect("/");
}

// --- session ---

export async function signOutAction() {
  await auth.signOut();
  redirect("/auth/sign-in");
}

// --- invites ---

export async function createInvite() {
  const user = await requireUser();
  const token = randomBytes(32).toString("base64url");
  await sql`
    INSERT INTO invites (token, created_by, expires_at)
    VALUES (${token}, ${user.id}, now() + interval '7 days')
  `;
  revalidatePath("/invites");
}

export async function revokeInvite(formData: FormData) {
  await requireUser();
  await sql`DELETE FROM invites WHERE token = ${String(formData.get("token"))}`;
  revalidatePath("/invites");
}

export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect(`/auth/sign-in?redirectTo=/invite/${token}`);
  const [invite] = (await sql`
    SELECT token FROM invites WHERE token = ${token} AND expires_at > now()
  `) as [{ token: string } | undefined];
  if (!invite) redirect(`/invite/${token}`);
  const name = session.user.name?.trim() || session.user.email;
  await sql`INSERT INTO users (id, name) VALUES (${session.user.id}, ${name}) ON CONFLICT (id) DO NOTHING`;
  redirect("/");
}

export async function removeMember(formData: FormData) {
  const user = await requireUser();
  const memberId = String(formData.get("userId"));
  if (memberId !== user.id) {
    await sql`DELETE FROM users WHERE id = ${memberId}`;
  }
  revalidatePath("/invites");
}

// --- lists ---

export async function createList(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await sql`INSERT INTO lists (name, created_by) VALUES (${name}, ${user.id})`;
  revalidatePath("/");
}

export async function renameList(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await sql`UPDATE lists SET name = ${name} WHERE id = ${String(formData.get("id"))}`;
  revalidatePath("/");
}

export async function deleteList(formData: FormData) {
  await requireUser();
  await sql`DELETE FROM lists WHERE id = ${String(formData.get("id"))}`;
  revalidatePath("/");
}

// --- items ---

export async function addItem(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const { quantity, unit } = parseQuantityUnit(formData);
  await sql`INSERT INTO items (list_id, name, quantity, unit, created_by) VALUES (${listId}, ${name}, ${quantity}, ${unit}, ${user.id})`;
  revalidatePath(`/list/${listId}`);
}

export async function toggleItem(formData: FormData) {
  await requireUser();
  const listId = String(formData.get("listId"));
  await sql`UPDATE items SET checked = NOT checked WHERE id = ${String(formData.get("id"))}`;
  revalidatePath(`/list/${listId}`);
}

export async function updateItem(formData: FormData) {
  await requireUser();
  const listId = String(formData.get("listId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const { quantity, unit } = parseQuantityUnit(formData);
  await sql`UPDATE items SET name = ${name}, quantity = ${quantity}, unit = ${unit} WHERE id = ${String(formData.get("id"))}`;
  revalidatePath(`/list/${listId}`);
}

export async function deleteItem(formData: FormData) {
  await requireUser();
  const listId = String(formData.get("listId"));
  await sql`UPDATE items SET deleted_at = now() WHERE id = ${String(formData.get("id"))}`;
  revalidatePath(`/list/${listId}`);
}
