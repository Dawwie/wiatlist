"use client";

import { Button, Input, Modal, useOverlayState } from "@heroui/react";
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
  const state = useOverlayState();

  return (
    <Modal state={state}>
      <Button aria-label="Zmień nazwę" variant="ghost" size="sm" onPress={state.open}>
        Edytuj
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Edytuj produkt</Modal.Heading>
            </Modal.Header>
            <form
              action={async (formData) => {
                await action(formData);
                state.close();
              }}
            >
              <Modal.Body className="flex flex-col gap-3">
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
                  aria-label="Nazwa"
                />
                <Input
                  name="quantity"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  defaultValue={quantity ?? ""}
                  placeholder="Ilość"
                  aria-label="Ilość"
                />
                <UnitSelect name="unit" defaultUnit={unit ?? DEFAULT_UNIT} />
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
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
