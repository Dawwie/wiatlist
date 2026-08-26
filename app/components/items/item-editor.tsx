"use client";

import { Button, Input, Modal, useOverlayState } from "@heroui/react";
import { updateItem } from "@/lib/items/actions";
import { DEFAULT_UNIT } from "@/lib/items/units";
import type { Item } from "@/lib/items";
import { useAutoFocus } from "../ui/autofocus";
import UnitSelect from "../ui/unit-select";

export default function ItemEditor({
  item,
  listId,
}: {
  item: Item;
  listId: string;
}) {
  const state = useOverlayState();

  return (
    <Modal state={state}>
      <Button aria-label="Edytuj produkt" variant="ghost" size="sm" onPress={state.open}>
        Edytuj
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Edytuj produkt</Modal.Heading>
            </Modal.Header>
            <EditForm item={item} listId={listId} onSaved={state.close} />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function EditForm({
  item,
  listId,
  onSaved,
}: {
  item: Item;
  listId: string;
  onSaved: () => void;
}) {
  const nameRef = useAutoFocus();

  return (
    <form
      action={async (formData) => {
        await updateItem(formData);
        onSaved();
      }}
    >
      <Modal.Body className="flex flex-col gap-3">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="listId" value={listId} />
        <Input
          ref={nameRef}
          name="name"
          defaultValue={item.name}
          required
          maxLength={100}
          aria-label="Nazwa"
        />
        <Input
          name="quantity"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          defaultValue={item.quantity ?? ""}
          placeholder="Ilość"
          aria-label="Ilość"
        />
        <UnitSelect name="unit" defaultUnit={item.unit ?? DEFAULT_UNIT} />
      </Modal.Body>
      <Modal.Footer>
        <Button slot="close" variant="ghost">
          Anuluj
        </Button>
        <Button type="submit" variant="primary">
          Zapisz
        </Button>
      </Modal.Footer>
    </form>
  );
}
