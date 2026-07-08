import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { setupOwner } from "@/lib/actions";

export default async function SetupPage() {
  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM users`) as [{ count: number }];
  if (count > 0) redirect("/");

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-2xl font-bold">Pierwsza konfiguracja</h1>
      <p className="mb-6 text-gray-600">
        Witaj w Wiatlist! Podaj swoje imię, aby utworzyć konto właściciela.
      </p>
      <form action={setupOwner} className="flex flex-col gap-3">
        <input
          name="name"
          required
          maxLength={50}
          placeholder="Twoje imię"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
        >
          Zaczynamy
        </button>
      </form>
    </div>
  );
}
