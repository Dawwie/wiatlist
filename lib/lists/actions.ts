"use server";

import { revalidatePath } from "next/cache";
import { sql, row } from "@/lib/db";
import { requireUser } from "@/lib/users";
import { requireListOwner } from "./access";

export async function createList(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const list = await row<{ id: string }>(sql`
    INSERT INTO lists (name, created_by) VALUES (${name}, ${user.id}) RETURNING id
  `);
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
