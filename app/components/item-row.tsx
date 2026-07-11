"use client";

import { motion } from "motion/react";
import { Button } from "@heroui/react";
import EditableName from "./editable-name";
import TrashIcon from "./trash-icon";
import {
  itemTransition,
  rowContentVariants,
  rowWrapperVariants,
} from "./item-animations";

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
  return (
    <motion.li
      layout
      custom={item.checked}
      variants={rowWrapperVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={itemTransition}
      className="overflow-hidden pb-2"
    >
      <motion.div
        variants={rowContentVariants}
        transition={itemTransition}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors duration-200 ${
          item.checked ? "border-muted/40" : "border-border"
        }`}
      >
        <form action={toggleItem} className="flex flex-1 items-center gap-3">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="listId" value={listId} />
          <button
            type="submit"
            className="flex-1 text-left"
          >
            <span
              aria-hidden
              className={`mr-3 inline-block h-5 w-5 rounded border align-middle text-center text-sm leading-5 transition-colors duration-200 ${
                item.checked
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border"
              }`}
            >
              <span
                className={`transition-opacity duration-200 ${
                  item.checked ? "opacity-100" : "opacity-0"
                }`}
              >
                ✓
              </span>
            </span>
            <span
              className={`transition-colors duration-200 ${
                item.checked ? "text-muted line-through" : ""
              }`}
            >
              {item.name}
            </span>
            {item.quantity != null && (
              <span className="ml-2 text-sm text-muted">
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
        <form action={deleteItem}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="listId" value={listId} />
          <Button
            type="submit"
            aria-label="Usuń produkt"
            variant="danger"
            size="sm"
            isIconOnly
          >
            <TrashIcon />
          </Button>
        </form>
      </motion.div>
    </motion.li>
  );
}
