import { redirect } from "next/navigation";
import { Button } from "@heroui/react";
import { getSessionUser } from "@/lib/users";
import { getInvitedList } from "@/lib/sharing";
import { acceptInvite } from "@/lib/sharing/actions";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const user = await getSessionUser();
  if (!user) redirect(`/auth/sign-in?redirectTo=/invite/${token}`);

  const invite = await getInvitedList(token);
  if (!invite) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-bold">Link wygasł</h1>
        <p className="text-muted">
          Ten link jest nieważny. Poproś o nowy link do udostępnienia.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-2xl font-bold">Udostępniono Ci listę</h1>
      <p className="mb-6 text-muted">
        „{invite.name}&rdquo; — dołączasz jako {user.name}
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
