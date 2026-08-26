"use client";

import { useOptimistic } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@heroui/react";
import { deleteAllItems, toggleItem } from "@/lib/items/actions";
import type { Item } from "@/lib/items";
import TrashIcon from "../ui/trash-icon";
import ItemRow from "./item-row";

export default function ItemList({
  items,
  listId,
}: {
  items: Item[];
  listId: string;
}) {
  const [optimisticItems, applyOptimistic] = useOptimistic(
    items,
    (state, action: { type: "toggle"; id: string } | { type: "clear" }) =>
      action.type === "clear"
        ? []
        : state
            .map((it) =>
              it.id === action.id ? { ...it, checked: !it.checked } : it,
            )
            .sort((a, b) => Number(a.checked) - Number(b.checked)),
  );

  async function handleToggle(formData: FormData) {
    applyOptimistic({ type: "toggle", id: String(formData.get("id")) });
    await toggleItem(formData);
  }

  async function handleDeleteAll(formData: FormData) {
    if (!confirm("Usunąć wszystkie produkty z listy?")) return;
    applyOptimistic({ type: "clear" });
    await deleteAllItems(formData);
  }

  return (
    <div>
      {optimisticItems.length > 0 && (
        <form action={handleDeleteAll} className="mb-2 flex justify-end">
          <input type="hidden" name="listId" value={listId} />
          <Button type="submit" variant="danger" size="sm">
            <TrashIcon />
            Usuń wszystkie
          </Button>
        </form>
      )}
      <ul className="flex flex-col">
        <AnimatePresence initial={false}>
          {optimisticItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              listId={listId}
              onToggle={handleToggle}
            />
          ))}
        </AnimatePresence>
        {optimisticItems.length === 0 && (
          <li className="text-sm text-muted">Lista jest pusta.</li>
        )}
      </ul>
    </div>
  );
}
