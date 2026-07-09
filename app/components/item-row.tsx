"use client";

import { useRef, useState } from "react";
import EditableName from "./editable-name";

export default function ItemRow({
  item,
  listId,
  toggleItem,
  deleteItem,
  updateItem,
}: {
  item: {
    id: string;
    name: string;
    checked: boolean;
    quantity: string | null;
    unit: string;
  };
  listId: string;
  toggleItem: (formData: FormData) => Promise<void>;
  deleteItem: (formData: FormData) => Promise<void>;
  updateItem: (formData: FormData) => Promise<void>;
}) {
  const [swingCheck, setSwingCheck] = useState(false);
  const [removing, setRemoving] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  return (
    <li
      className={`flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 ${
        removing ? "animate-swing-out" : "animate-swing-in"
      }`}
      onAnimationEnd={() => {
        if (removing) deleteFormRef.current?.requestSubmit();
      }}
    >
      <form action={toggleItem} className="flex flex-1 items-center gap-3">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="listId" value={listId} />
        <button
          type="submit"
          onClick={() => setSwingCheck(true)}
          className={`flex-1 text-left ${
            item.checked ? "text-gray-400 line-through" : ""
          }`}
        >
          <span
            aria-hidden
            onAnimationEnd={(e) => {
              e.stopPropagation();
              setSwingCheck(false);
            }}
            className={`mr-3 inline-block h-5 w-5 rounded border align-middle text-center text-sm leading-5 ${
              swingCheck ? "animate-swing" : ""
            } ${
              item.checked
                ? "border-green-600 bg-green-600 text-white"
                : "border-gray-300"
            }`}
          >
            {item.checked ? "✓" : ""}
          </span>
          {item.name}
          {item.quantity != null && (
            <span className="ml-2 text-sm text-gray-500">
              {Number(item.quantity)} {item.unit}
            </span>
          )}
        </button>
      </form>
      <EditableName
        id={item.id}
        name={item.name}
        quantity={item.quantity}
        unit={item.unit}
        action={updateItem}
        extraFields={{ listId }}
      />
      <form action={deleteItem} ref={deleteFormRef}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="listId" value={listId} />
        <button
          type="submit"
          aria-label="Usuń produkt"
          onClick={(e) => {
            e.preventDefault();
            setRemoving(true);
          }}
          className="rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
        >
          Usuń
        </button>
      </form>
    </li>
  );
}
