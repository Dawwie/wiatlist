import { headers } from "next/headers";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createInvite, removeMember, revokeInvite } from "@/lib/actions";
import CopyButton from "../components/copy-button";

export const dynamic = "force-dynamic";

export default async function InvitesPage() {
  const user = await requireUser();
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  const invites = (await sql`
    SELECT token, expires_at FROM invites WHERE expires_at > now() ORDER BY created_at DESC
  `) as { token: string; expires_at: string }[];
  const members = (await sql`
    SELECT id, name FROM users ORDER BY created_at
  `) as { id: string; name: string }[];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-4 text-xl font-bold">Zaproszenia</h1>
        <form action={createInvite}>
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            Wygeneruj link z zaproszeniem
          </button>
        </form>
        <ul className="mt-4 flex flex-col gap-3">
          {invites.map((invite) => {
            const url = `${protocol}://${host}/invite/${invite.token}`;
            return (
              <li key={invite.token} className="rounded-lg border border-gray-200 p-3">
                <p className="mb-2 break-all text-xs text-gray-500">{url}</p>
                <div className="flex items-center gap-2">
                  <CopyButton text={url} />
                  <form action={revokeInvite}>
                    <input type="hidden" name="token" value={invite.token} />
                    <button
                      type="submit"
                      className="rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Unieważnij
                    </button>
                  </form>
                  <span className="ml-auto text-xs text-gray-400">
                    ważny do {new Date(invite.expires_at).toLocaleDateString("pl-PL")}
                  </span>
                </div>
              </li>
            );
          })}
          {invites.length === 0 && (
            <li className="text-sm text-gray-500">Brak aktywnych zaproszeń.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Domownicy</h2>
        <ul className="flex flex-col gap-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <span>
                {member.name}
                {member.id === user.id && (
                  <span className="ml-2 text-xs text-gray-400">(ty)</span>
                )}
              </span>
              {member.id !== user.id && (
                <form action={removeMember}>
                  <input type="hidden" name="userId" value={member.id} />
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Usuń
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
