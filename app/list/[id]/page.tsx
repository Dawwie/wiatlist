import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { sql } from "@/lib/db";
import { requireUser, requireListAccess } from "@/lib/auth";
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
import ShareButton from "../../components/share-button";
import UnitSelect from "../../components/unit-select";

export const dynamic = "force-dynamic";

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [list] = (await sql`
    SELECT l.id, l.name, l.created_by, owner.name AS owner_name
    FROM lists l
    LEFT JOIN users owner ON owner.id = l.created_by
    WHERE l.id = ${id}
  `) as [
    {
      id: string;
      name: string;
      created_by: string | null;
      owner_name: string | null;
    } | undefined,
  ];
  if (!list) notFound();
  await requireListAccess(user.id, id);
  const isOwner = list.created_by === user.id;

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
    SELECT lower(trim(i.name)) AS product
    FROM items i
    JOIN list_members m ON m.list_id = i.list_id AND m.user_id = ${user.id}
    GROUP BY 1
    HAVING lower(trim(i.name)) <> ALL (
      SELECT lower(trim(name)) FROM items
      WHERE list_id = ${id} AND deleted_at IS NULL
    )
    ORDER BY count(*) DESC, max(i.created_at) DESC
    LIMIT 30
  `) as { product: string }[];

  const [{ v: version }] = (await sql`
    SELECT (extract(epoch from coalesce(max(updated_at), to_timestamp(0))) * 1000)::bigint::text AS v
    FROM items WHERE list_id = ${id}
  `) as [{ v: string }];

  let share: {
    links: { token: string; url: string; expiresAt: string }[];
    members: { id: string; name: string; email: string }[];
  } | null = null;
  if (isOwner) {
    const h = await headers();
    const host = h.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const links = (await sql`
      SELECT token, expires_at FROM invites
      WHERE list_id = ${id} AND expires_at > now()
      ORDER BY created_at DESC
    `) as { token: string; expires_at: string }[];
    const members = (await sql`
      SELECT u.id, u.name, au.email
      FROM list_members lm
      JOIN users u ON u.id = lm.user_id
      JOIN neon_auth."user" au ON au.id = u.id
      WHERE lm.list_id = ${id}
      ORDER BY lm.created_at
    `) as { id: string; name: string; email: string }[];
    share = {
      links: links.map((l) => ({
        token: l.token,
        url: `${protocol}://${host}/invite/${l.token}`,
        expiresAt: l.expires_at,
      })),
      members,
    };
  }

  return (
    <div>
      <RefreshPoller listId={list.id} initialVersion={version} />
      <div className="mb-4 flex items-center gap-2">
        <Link href="/" className="text-sm text-gray-500">
          ← Listy
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{list.name}</h1>
          {!isOwner && (
            <p className="text-xs text-gray-500">
              Udostępniona
              {list.owner_name ? ` przez ${list.owner_name}` : ""}
            </p>
          )}
        </div>
        {share && (
          <ShareButton
            listId={list.id}
            links={share.links}
            members={share.members}
            ownerId={user.id}
          />
        )}
      </div>

      <form
        action={addItem}
        className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
      >
        <input type="hidden" name="listId" value={list.id} />
        <ProductCombobox suggestions={suggestions.map((s) => s.product)} />
        <div className="flex gap-2 sm:contents">
          <Input
            name="quantity"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            placeholder="Ilość"
            className="min-w-0 flex-1 sm:w-24 sm:flex-none"
          />
          <UnitSelect
            name="unit"
            defaultUnit={DEFAULT_UNIT}
            className="min-w-0 flex-1 sm:flex-none"
          />
          <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
            Dodaj
          </Button>
        </div>
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
