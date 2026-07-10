import { redirect } from "next/navigation";
import { Button } from "@heroui/react";
import { sql } from "@/lib/db";
import { auth } from "@/lib/neon-auth/server";
import { acceptInvite } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: session } = await auth.getSession();
  if (!session?.user) redirect(`/auth/sign-in?redirectTo=/invite/${token}`);

  const [invite] = (await sql`
    SELECT l.name
    FROM invites i
    JOIN lists l ON l.id = i.list_id
    WHERE i.token = ${token} AND i.expires_at > now()
  `) as [{ name: string } | undefined];

  if (!invite) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-bold">Link wygasł</h1>
        <p className="text-gray-600">
          Ten link jest nieważny. Poproś o nowy link do udostępnienia.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-2xl font-bold">Udostępniono Ci listę</h1>
      <p className="mb-6 text-gray-600">
        „{invite.name}" — dołączasz jako{" "}
        {session.user.name || session.user.email}
      </p>
      <form action={acceptInvite}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="primary" fullWidth>
          Dołącz do listy
        </Button>
      </form>
    </div>
  );
}
