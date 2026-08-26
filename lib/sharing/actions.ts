"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSessionUser, requireUser } from "@/lib/users";
import { requireListOwner } from "@/lib/lists";
import { getInvitedList } from "./queries";

const INVITE_TTL = "7 days";

// Only the owner may mint or revoke links, or remove members.
async function authorizeOwner(formData: FormData) {
  const user = await requireUser();
  const listId = String(formData.get("listId"));
  await requireListOwner(user.id, listId);
  return { user, listId };
}

export async function createInvite(formData: FormData) {
  const { user, listId } = await authorizeOwner(formData);
  const token = randomBytes(32).toString("base64url");
  await sql`
    INSERT INTO invites (token, list_id, created_by, expires_at)
    VALUES (${token}, ${listId}, ${user.id}, now() + ${INVITE_TTL}::interval)
  `;
  revalidatePath(`/list/${listId}`);
}

export async function revokeInvite(formData: FormData) {
  const { listId } = await authorizeOwner(formData);
  await sql`
    DELETE FROM invites
    WHERE token = ${String(formData.get("token"))} AND list_id = ${listId}
  `;
  revalidatePath(`/list/${listId}`);
}

export async function removeListMember(formData: FormData) {
  const { user, listId } = await authorizeOwner(formData);
  const memberId = String(formData.get("userId"));
  // The owner can't remove themselves — that would orphan their own list.
  if (memberId === user.id) return;
  await sql`DELETE FROM list_members WHERE list_id = ${listId} AND user_id = ${memberId}`;
  revalidatePath(`/list/${listId}`);
}

// Bearer-token join: holding a live link is the authorization. `getSessionUser()`
// provisions the `users` row as a side effect, so no upsert is needed here.
export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const user = await getSessionUser();
  if (!user) redirect(`/auth/sign-in?redirectTo=/invite/${token}`);
  const invite = await getInvitedList(token);
  if (!invite) redirect(`/invite/${token}`);
  await sql`
    INSERT INTO list_members (list_id, user_id)
    VALUES (${invite.listId}, ${user.id}) ON CONFLICT DO NOTHING
  `;
  redirect(`/list/${invite.listId}`);
}
