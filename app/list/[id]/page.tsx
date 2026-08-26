import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { requireUser } from "@/lib/users";
import { getListForMember } from "@/lib/lists";
import { addItem } from "@/lib/items/actions";
import {
  DEFAULT_UNIT,
  getListItems,
  getListVersion,
  getProductSuggestions,
} from "@/lib/items";
import { getShareState } from "@/lib/sharing";
import ItemList from "../../components/items/item-list";
import ProductCombobox from "../../components/items/product-combobox";
import RefreshPoller from "../../components/lists/refresh-poller";
import ShareButton from "../../components/sharing/share-button";
import UnitSelect from "../../components/ui/unit-select";

export const dynamic = "force-dynamic";

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  // Membership is part of the query: a non-member gets nothing back.
  const list = await getListForMember(user.id, id);
  if (!list) notFound();

  const [items, suggestions, version, share] = await Promise.all([
    getListItems(id),
    getProductSuggestions(user.id, id),
    getListVersion(id),
    list.isOwner ? getShareState(id) : null,
  ]);

  return (
    <div>
      <RefreshPoller listId={list.id} initialVersion={version} />
      <div className="mb-4 flex items-center gap-2">
        <Link href="/" className="text-sm text-muted">
          ← Listy
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{list.name}</h1>
          {!list.isOwner && (
            <p className="text-xs text-muted">
              Udostępniona
              {list.ownerName ? ` przez ${list.ownerName}` : ""}
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
        <ProductCombobox suggestions={suggestions} />
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

      <ItemList items={items} listId={list.id} />
    </div>
  );
}
