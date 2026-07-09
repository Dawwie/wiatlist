import Link from "next/link";
import { Button } from "@heroui/react";
import { auth } from "@/lib/neon-auth/server";
import { signOutAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const { data: session } = await auth.getSession();

  return (
    <div className="mx-auto mt-16 max-w-sm text-center">
      <h1 className="mb-2 text-2xl font-bold">Brak dostępu</h1>
      <p className="mb-6 text-gray-600">
        Wiatlist jest dostępny tylko dla zaproszonych domowników. Poproś
        właściciela o link z zaproszeniem.
      </p>
      {session?.user && (
        <p className="mb-4 text-sm text-gray-500">
          Zalogowano jako {session.user.name || session.user.email}
        </p>
      )}
      <div className="flex flex-col items-center gap-3">
        <Link href="/setup" className="text-sm text-green-700 underline">
          Pierwsza konfiguracja
        </Link>
        {session?.user && (
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Wyloguj / zaloguj na inne konto
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
