"use client";

import { Button, Input, Modal, useOverlayState } from "@heroui/react";
import { renameList } from "@/lib/lists/actions";

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
            <form
              action={async (formData) => {
                await renameList(formData);
                state.close();
              }}
            >
              <Modal.Body>
                <input type="hidden" name="id" value={id} />
                <Input
                  name="name"
                  defaultValue={name}
                  required
                  maxLength={100}
                  autoFocus
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
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
