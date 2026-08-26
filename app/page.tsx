import Link from "next/link";
import { Button, Input } from "@heroui/react";
import { requireUser } from "@/lib/users";
import { getListsForUser } from "@/lib/lists";
import { createList, deleteList } from "@/lib/lists/actions";
import ListNameEditor from "./components/lists/list-name-editor";
import TrashIcon from "./components/ui/trash-icon";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireUser();
  const lists = await getListsForUser(user.id);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Listy zakupów</h1>

      <form action={createList} className="mb-6 flex gap-2">
        <Input
          name="name"
          required
          maxLength={100}
          placeholder="Nowa lista, np. Biedronka"
          className="flex-1"
        />
        <Button type="submit" variant="primary">
          Dodaj
        </Button>
      </form>

      <ul className="flex flex-col gap-2">
        {lists.map((list) => (
          <li
            key={list.id}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
          >
            <Link href={`/list/${list.id}`} className="flex-1 font-medium">
              <span className="flex items-center">
                {list.name}
                {list.openItems > 0 && (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-soft-foreground">
                    {list.openItems}
                  </span>
                )}
              </span>
              {!list.isOwner && (
                <span className="mt-0.5 block text-xs font-normal text-muted">
                  Udostępniona
                  {list.ownerName ? ` przez ${list.ownerName}` : ""}
                </span>
              )}
            </Link>
            {list.isOwner && (
              <>
                <ListNameEditor id={list.id} name={list.name} />
                <form action={deleteList}>
                  <input type="hidden" name="id" value={list.id} />
                  <Button
                    type="submit"
                    aria-label="Usuń listę"
                    variant="danger"
                    size="sm"
                    isIconOnly
                  >
                    <TrashIcon />
                  </Button>
                </form>
              </>
            )}
          </li>
        ))}
        {lists.length === 0 && (
          <li className="text-sm text-muted">
            Nie masz jeszcze żadnej listy — dodaj pierwszą powyżej.
          </li>
        )}
      </ul>
    </div>
  );
}
