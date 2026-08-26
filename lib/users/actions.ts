"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/neon-auth/server";

export async function signOutAction() {
  await auth.signOut();
  redirect("/auth/sign-in");
}
