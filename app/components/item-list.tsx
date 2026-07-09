"use client";

import { useOptimistic } from "react";
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
  updateItem,
}: {
  items: Item[];
  listId: string;
  toggleItem: (formData: FormData) => Promise<void>;
  deleteItem: (formData: FormData) => Promise<void>;
  updateItem: (formData: FormData) => Promise<void>;
}) {
  const [optimisticItems, toggleOptimistic] = useOptimistic(
    items,
    (state, toggledId: string) =>
      state
        .map((it) =>
          it.id === toggledId ? { ...it, checked: !it.checked } : it,
        )
        .sort((a, b) => Number(a.checked) - Number(b.checked)),
  );

  async function handleToggle(formData: FormData) {
    toggleOptimistic(String(formData.get("id")));
    await toggleItem(formData);
  }

  return (
    <ul className="flex flex-col gap-2">
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
      {optimisticItems.length === 0 && (
        <li className="text-sm text-gray-500">Lista jest pusta.</li>
      )}
    </ul>
  );
}
