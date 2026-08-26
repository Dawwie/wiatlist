"use client";

import { Button, Input, Modal, useOverlayState } from "@heroui/react";
import { renameList } from "@/lib/lists/actions";
import { useAutoFocus } from "../ui/autofocus";

export default function ListNameEditor({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const state = useOverlayState();

  return (
    <Modal state={state}>
      <Button aria-label="Zmień nazwę listy" variant="ghost" size="sm" onPress={state.open}>
        Edytuj
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Zmień nazwę listy</Modal.Heading>
            </Modal.Header>
            <RenameForm id={id} name={name} onSaved={state.close} />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function RenameForm({
  id,
  name,
  onSaved,
}: {
  id: string;
  name: string;
  onSaved: () => void;
}) {
  const nameRef = useAutoFocus();

  return (
    <form
      action={async (formData) => {
        await renameList(formData);
        onSaved();
      }}
    >
      <Modal.Body>
        <input type="hidden" name="id" value={id} />
        <Input
          ref={nameRef}
          name="name"
          defaultValue={name}
          required
          maxLength={100}
          aria-label="Nazwa listy"
        />
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
