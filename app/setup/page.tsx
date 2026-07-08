import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { auth } from "@/lib/neon-auth/server";
import { setupOwner } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM users`) as [{ count: number }];
  if (count > 0) redirect("/");

  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in?redirectTo=/setup");

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-2xl font-bold">Pierwsza konfiguracja</h1>
      <p className="mb-6 text-gray-600">
        Zalogowano jako {session.user.name || session.user.email}. Zostań
        właścicielem Wiatlist.
      </p>
      <form action={setupOwner}>
        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
        >
          Zaczynamy
        </button>
      </form>
    </div>
  );
}
