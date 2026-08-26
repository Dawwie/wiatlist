"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { createInvite, removeListMember, revokeInvite } from "@/lib/sharing/actions";
import type { ListMember, ShareLink } from "@/lib/sharing";
import TrashIcon from "../ui/trash-icon";
import CopyButton from "./copy-button";

export default function ShareButton({
  listId,
  links,
  members,
  ownerId,
}: {
  listId: string;
  links: ShareLink[];
  members: ListMember[];
  ownerId: string;
}) {
  const state = useOverlayState();

  return (
    <Modal state={state}>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto"
        onPress={state.open}
      >
        Udostępnij
      </Button>
      <Modal.Backdrop variant="blur">
        <Modal.Container size="md" placement="center">
          <Modal.Dialog className="bg-background">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Udostępnij listę</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-6">
              <section>
                <form action={createInvite}>
                  <input type="hidden" name="listId" value={listId} />
                  <Button type="submit" variant="primary" size="sm">
                    Wygeneruj link
                  </Button>
                </form>
                <ul className="mt-3 flex flex-col gap-3">
                  {links.map((link) => (
                    <li
                      key={link.token}
                      className="rounded-lg border border-border p-3"
                    >
                      <p className="mb-2 break-all text-xs text-muted">
                        {link.url}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <CopyButton text={link.url} />
                        <form action={revokeInvite}>
                          <input type="hidden" name="listId" value={listId} />
                          <input type="hidden" name="token" value={link.token} />
                          <Button type="submit" variant="danger" size="sm">
                            <TrashIcon />
                            Unieważnij
                          </Button>
                        </form>
                        <span className="ml-auto whitespace-nowrap text-xs text-muted">
                          ważny do{" "}
                          {new Date(link.expiresAt).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                    </li>
                  ))}
                  {links.length === 0 && (
                    <li className="text-sm text-muted">
                      Brak aktywnych linków.
                    </li>
                  )}
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-bold">Osoby z dostępem</h3>
                <ul className="flex flex-col gap-2">
                  {members.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <span className="text-sm">
                        {member.name}
                        <span className="ml-2 text-xs text-muted">
                          {member.email}
                        </span>
                        {member.id === ownerId && (
                          <span className="ml-2 text-xs text-muted">
                            (właściciel)
                          </span>
                        )}
                      </span>
                      {member.id !== ownerId && (
                        <form action={removeListMember}>
                          <input type="hidden" name="listId" value={listId} />
                          <input type="hidden" name="userId" value={member.id} />
                          <Button
                            type="submit"
                            aria-label="Usuń dostęp"
                            variant="danger"
                            size="sm"
                            isIconOnly
                          >
                            <TrashIcon />
                          </Button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
