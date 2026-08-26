"use client";

import { useEffect, useRef } from "react";

/**
 * Focus a field once its modal has opened.
 *
 * Not `autoFocus`: React Aria's `Input` spreads that straight onto the DOM
 * node, so the browser focuses during commit — before the overlay's
 * `usePreventScroll` patches `HTMLElement.focus`. iOS Safari then runs its
 * native "centre the focused input in the visual viewport" scroll, which drags
 * the fixed-position modal off the top of the screen. Focusing from an effect
 * happens after that patch is installed, so React Aria keeps the overlay
 * aligned with the shrunken viewport instead.
 *
 * Call from a component mounted by the dialog, not from the one holding
 * `<Modal>` — that one is mounted while the dialog is still closed.
 */
export function useAutoFocus() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
}
