import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  addItem,
  deleteItem,
  deleteAllItems,
  updateItem,
  toggleItem,
} from "@/lib/actions";
import { DEFAULT_UNIT } from "@/lib/units";
import ItemList from "../../components/item-list";
import ProductCombobox from "../../components/product-combobox";
import RefreshPoller from "../../components/refresh-poller";
import UnitSelect from "../../components/unit-select";

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

  const [{ v: version }] = (await sql`
    SELECT (extract(epoch from coalesce(max(updated_at), to_timestamp(0))) * 1000)::bigint::text AS v
    FROM items WHERE list_id = ${id}
  `) as [{ v: string }];

  return (
    <div>
      <RefreshPoller listId={list.id} initialVersion={version} />
      <div className="mb-4 flex items-center gap-2">
        <Link href="/" className="text-sm text-gray-500">
          ← Listy
        </Link>
        <h1 className="text-xl font-bold">{list.name}</h1>
      </div>

      <form action={addItem} className="mb-6 flex flex-wrap gap-2">
        <input type="hidden" name="listId" value={list.id} />
        <ProductCombobox suggestions={suggestions.map((s) => s.product)} />
        <Input
          name="quantity"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder="Ilość"
          className="w-24"
        />
        <UnitSelect name="unit" defaultUnit={DEFAULT_UNIT} />
        <Button type="submit" variant="primary">
          Dodaj
        </Button>
      </form>

      <ItemList
        items={items}
        listId={list.id}
        toggleItem={toggleItem}
        deleteItem={deleteItem}
        deleteAllItems={deleteAllItems}
        updateItem={updateItem}
      />
    </div>
  );
}
