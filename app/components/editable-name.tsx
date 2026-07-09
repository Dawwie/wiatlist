"use client";

import { useState } from "react";
import { UNITS, DEFAULT_UNIT } from "@/lib/units";

export default function EditableName({
  id,
  name,
  quantity,
  unit,
  action,
  extraFields = {},
}: {
  id: string;
  name: string;
  quantity?: string | null;
  unit?: string;
  action: (formData: FormData) => Promise<void>;
  extraFields?: Record<string, string>;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        aria-label="Zmień nazwę"
        onClick={() => setEditing(true)}
        className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-50"
      >
        Edytuj
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setEditing(false);
      }}
      className="flex items-center gap-1"
    >
      <input type="hidden" name="id" value={id} />
      {Object.entries(extraFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <input
        name="name"
        defaultValue={name}
        required
        maxLength={100}
        autoFocus
        className="w-32 rounded-lg border border-gray-300 px-2 py-1 text-sm"
      />
      <input
        name="quantity"
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        defaultValue={quantity ?? ""}
        placeholder="Ilość"
        className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
      />
      <select
        name="unit"
        defaultValue={unit ?? DEFAULT_UNIT}
        className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-green-600 px-2 py-1 text-sm text-white"
      >
        OK
      </button>
    </form>
  );
}
