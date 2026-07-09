import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { addItem, deleteItem, updateItem, toggleItem } from "@/lib/actions";
import { UNITS, DEFAULT_UNIT } from "@/lib/units";
import ItemRow from "../../components/item-row";
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
    SELECT id, name, checked, quantity, unit
    FROM items
    WHERE list_id = ${id} AND deleted_at IS NULL
    ORDER BY checked, created_at DESC
  `) as {
    id: string;
    name: string;
    checked: boolean;
    quantity: string | null;
    unit: string;
  }[];

  const suggestions = (await sql`
    SELECT lower(trim(name)) AS product
    FROM items
    GROUP BY 1
    HAVING lower(trim(name)) <> ALL (
      SELECT lower(trim(name)) FROM items
      WHERE list_id = ${id} AND deleted_at IS NULL
    )
    ORDER BY count(*) DESC, max(created_at) DESC
    LIMIT 30
  `) as { product: string }[];

  return (
    <div>
      <RefreshPoller intervalMs={5000} />
      <div className="mb-4 flex items-center gap-2">
        <Link href="/" className="text-sm text-gray-500">
          ← Listy
        </Link>
        <h1 className="text-xl font-bold">{list.name}</h1>
      </div>

      <form action={addItem} className="mb-6 flex flex-wrap gap-2">
        <input type="hidden" name="listId" value={list.id} />
        <input
          name="name"
          required
          maxLength={100}
          placeholder="Dodaj produkt, np. mleko"
          list="product-suggestions"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
        />
        <datalist id="product-suggestions">
          {suggestions.map((s) => (
            <option key={s.product} value={s.product} />
          ))}
        </datalist>
        <input
          name="quantity"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder="Ilość"
          className="w-24 rounded-lg border border-gray-300 px-3 py-2"
        />
        <select
          name="unit"
          defaultValue={DEFAULT_UNIT}
          className="rounded-lg border border-gray-300 px-3 py-2"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
        >
          Dodaj
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {suggestions.slice(0, 8).map((s) => (
            <form key={s.product} action={addItem}>
              <input type="hidden" name="listId" value={list.id} />
              <input type="hidden" name="name" value={s.product} />
              <button
                type="submit"
                className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
              >
                + {s.product}
              </button>
            </form>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            listId={list.id}
            toggleItem={toggleItem}
            deleteItem={deleteItem}
            updateItem={updateItem}
          />
        ))}
        {items.length === 0 && (
          <li className="text-sm text-gray-500">Lista jest pusta.</li>
        )}
      </ul>
    </div>
  );
}
