"use client";

import { Select, ListBox } from "@heroui/react";
import { UNITS } from "@/lib/items/units";

export default function UnitSelect({
  name,
  defaultUnit,
  className,
}: {
  name: string;
  defaultUnit: string;
  className?: string;
}) {
  return (
    <Select
      name={name}
      defaultSelectedKey={defaultUnit}
      aria-label="Jednostka"
      className={className}
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {UNITS.map((u) => (
            <ListBox.Item key={u} id={u}>
              {u}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
