import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { addItem, deleteItem, renameItem, toggleItem } from "@/lib/actions";
import EditableName from "../../components/editable-name";
import RefreshPoller from "../../components/refresh-poller";

export const dynamic = "force-dynamic";

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const [list] = (await sql`
    SELECT id, name FROM lists WHERE id = ${id}
  `) as [{ id: string; name: string } | undefined];
  if (!list) notFound();

  const items = (await sql`
    SELECT id, name, checked
    FROM items
    WHERE list_id = ${id} AND deleted_at IS NULL
    ORDER BY checked, created_at DESC
  `) as { id: string; name: string; checked: boolean }[];

  return (
    <div>
      <RefreshPoller intervalMs={5000} />
      <div className="mb-4 flex items-center gap-2">
        <Link href="/" className="text-sm text-gray-500">
          ← Listy
        </Link>
        <h1 className="text-xl font-bold">{list.name}</h1>
      </div>

      <form action={addItem} className="mb-6 flex gap-2">
        <input type="hidden" name="listId" value={list.id} />
        <input
          name="name"
          required
          maxLength={100}
          placeholder="Dodaj produkt, np. mleko"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
        >
          Dodaj
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
          >
            <form action={toggleItem} className="flex flex-1 items-center gap-3">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="listId" value={list.id} />
              <button
                type="submit"
                className={`flex-1 text-left ${
                  item.checked ? "text-gray-400 line-through" : ""
                }`}
              >
                <span
                  aria-hidden
                  className={`mr-3 inline-block h-5 w-5 rounded border align-middle text-center text-sm leading-5 ${
                    item.checked
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {item.checked ? "✓" : ""}
                </span>
                {item.name}
              </button>
            </form>
            <EditableName
              id={item.id}
              name={item.name}
              action={renameItem}
              extraFields={{ listId: list.id }}
            />
            <form action={deleteItem}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="listId" value={list.id} />
              <button
                type="submit"
                aria-label="Usuń produkt"
                className="rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Usuń
              </button>
            </form>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-gray-500">Lista jest pusta.</li>
        )}
      </ul>
    </div>
  );
}
