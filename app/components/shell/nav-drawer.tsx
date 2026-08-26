"use client";

import Link from "next/link";
import { Button, Drawer, useOverlayState } from "@heroui/react";
import { signOutAction } from "@/lib/users/actions";

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export default function NavDrawer() {
  const state = useOverlayState();

  return (
    <div className="sm:hidden">
      <Drawer state={state}>
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          aria-label="Menu"
          onPress={state.open}
        >
          <MenuIcon />
        </Button>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content placement="right">
            <Drawer.Dialog className="bg-background">
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Menu</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="flex flex-col gap-2">
                <Link
                  href="/stats"
                  onClick={state.close}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-forest"
                >
                  <ChartIcon />
                  Statystyki
                </Link>
                <form action={signOutAction}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 px-3"
                  >
                    <LogOutIcon />
                    Wyloguj
                  </Button>
                </form>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
