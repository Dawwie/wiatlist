"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "./db";
import { createSession, requireUser } from "./auth";

// --- bootstrap ---

export async function setupOwner(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM users`) as [{ count: number }];
  if (count > 0) redirect("/");
  const [user] = (await sql`INSERT INTO users (name) VALUES (${name}) RETURNING id`) as [{ id: string }];
  await createSession(user.id);
  redirect("/");
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
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const [invite] = (await sql`
    SELECT token FROM invites WHERE token = ${token} AND expires_at > now()
  `) as [{ token: string } | undefined];
  if (!invite) redirect(`/invite/${token}`);
  const [user] = (await sql`INSERT INTO users (name) VALUES (${name}) RETURNING id`) as [{ id: string }];
  await createSession(user.id);
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
  await sql`INSERT INTO items (list_id, name, created_by) VALUES (${listId}, ${name}, ${user.id})`;
  revalidatePath(`/list/${listId}`);
}

export async function toggleItem(formData: FormData) {
  await requireUser();
  const listId = String(formData.get("listId"));
  await sql`UPDATE items SET checked = NOT checked WHERE id = ${String(formData.get("id"))}`;
  revalidatePath(`/list/${listId}`);
}

export async function renameItem(formData: FormData) {
  await requireUser();
  const listId = String(formData.get("listId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await sql`UPDATE items SET name = ${name} WHERE id = ${String(formData.get("id"))}`;
  revalidatePath(`/list/${listId}`);
}

export async function deleteItem(formData: FormData) {
  await requireUser();
  const listId = String(formData.get("listId"));
  await sql`UPDATE items SET deleted_at = now() WHERE id = ${String(formData.get("id"))}`;
  revalidatePath(`/list/${listId}`);
}
