"use client";

import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { DEFAULT_UNIT } from "@/lib/units";
import UnitSelect from "./unit-select";

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
      <Button
        aria-label="Zmień nazwę"
        variant="ghost"
        size="sm"
        onPress={() => setEditing(true)}
      >
        Edytuj
      </Button>
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
      <Input
        name="name"
        defaultValue={name}
        required
        maxLength={100}
        autoFocus
        className="w-32"
      />
      <Input
        name="quantity"
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        defaultValue={quantity ?? ""}
        placeholder="Ilość"
        className="w-16"
      />
      <UnitSelect name="unit" defaultUnit={unit ?? DEFAULT_UNIT} />
      <Button type="submit" variant="primary" size="sm">
        OK
      </Button>
    </form>
  );
}
