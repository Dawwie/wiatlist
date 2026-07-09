import { redirect } from "next/navigation";
import { Button } from "@heroui/react";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { auth } from "@/lib/neon-auth/server";
import { acceptInvite } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (await getSessionUser()) redirect("/");

  const { data: session } = await auth.getSession();
  if (!session?.user) redirect(`/auth/sign-in?redirectTo=/invite/${token}`);

  const [invite] = (await sql`
    SELECT token FROM invites WHERE token = ${token} AND expires_at > now()
  `) as [{ token: string } | undefined];

  if (!invite) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-bold">Zaproszenie wygasło</h1>
        <p className="text-gray-600">
          Ten link jest nieważny. Poproś o nowy link z zaproszeniem.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-2xl font-bold">Dołącz do Wiatlist</h1>
      <p className="mb-6 text-gray-600">
        Dołączasz jako {session.user.name || session.user.email}
      </p>
      <form action={acceptInvite}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="primary" fullWidth>
          Dołącz
        </Button>
      </form>
    </div>
  );
}
