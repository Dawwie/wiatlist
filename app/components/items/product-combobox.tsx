"use client";

import { ComboBox, Input, ListBox } from "@heroui/react";

export default function ProductCombobox({
  suggestions,
}: {
  suggestions: string[];
}) {
  const items = suggestions.map((s) => ({ id: s, name: s }));

  return (
    <ComboBox
      name="name"
      aria-label="Dodaj produkt"
      allowsCustomValue
      isRequired
      menuTrigger="input"
      className="w-full sm:flex-1"
      defaultItems={items}
    >
      <ComboBox.InputGroup className="w-full">
        <Input
          placeholder="Dodaj produkt, np. mleko"
          maxLength={100}
          autoComplete="off"
        />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {(item: { id: string; name: string }) => (
            <ListBox.Item id={item.id} textValue={item.name}>
              {item.name}
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
