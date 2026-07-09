"use client";

import { useOptimistic } from "react";
import { AnimatePresence } from "motion/react";
import ItemRow from "./item-row";

type Item = {
  id: string;
  name: string;
  checked: boolean;
  quantity: string | null;
  unit: string;
};

export default function ItemList({
  items,
  listId,
  toggleItem,
  deleteItem,
  deleteAllItems,
  updateItem,
}: {
  items: Item[];
  listId: string;
  toggleItem: (formData: FormData) => Promise<void>;
  deleteItem: (formData: FormData) => Promise<void>;
  deleteAllItems: (formData: FormData) => Promise<void>;
  updateItem: (formData: FormData) => Promise<void>;
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
          <button
            type="submit"
            className="rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Usuń wszystkie
          </button>
        </form>
      )}
      <ul className="flex flex-col">
        <AnimatePresence initial={false}>
          {optimisticItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              listId={listId}
              toggleItem={handleToggle}
              deleteItem={deleteItem}
              updateItem={updateItem}
            />
          ))}
        </AnimatePresence>
        {optimisticItems.length === 0 && (
          <li className="text-sm text-gray-500">Lista jest pusta.</li>
        )}
      </ul>
    </div>
  );
}
