import Link from "next/link";
import { Button, Input } from "@heroui/react";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createList, deleteList, renameList } from "@/lib/actions";
import EditableName from "./components/editable-name";
import TrashIcon from "./components/trash-icon";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireUser();
  const lists = (await sql`
    SELECT l.id, l.name,
           count(i.id) FILTER (WHERE i.deleted_at IS NULL AND NOT i.checked)::int AS open_items
    FROM lists l
    LEFT JOIN items i ON i.list_id = l.id
    GROUP BY l.id, l.name, l.created_at
    ORDER BY l.created_at DESC
  `) as { id: string; name: string; open_items: number }[];

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
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
          >
            <Link href={`/list/${list.id}`} className="flex-1 font-medium">
              {list.name}
              {list.open_items > 0 && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                  {list.open_items}
                </span>
              )}
            </Link>
            <EditableName id={list.id} name={list.name} action={renameList} />
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
          </li>
        ))}
        {lists.length === 0 && (
          <li className="text-sm text-gray-500">
            Nie masz jeszcze żadnej listy — dodaj pierwszą powyżej.
          </li>
        )}
      </ul>
    </div>
  );
}
