import type { Transition, Variants } from "motion/react";

export const itemTransition: Transition = { duration: 0.2, ease: "easeOut" };

// Outer wrapper: collapses height on add/remove, dims when checked (via `custom`).
export const rowWrapperVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: (checked: boolean) => ({
    height: "auto",
    opacity: checked ? 0.5 : 1,
  }),
  exit: { height: 0, opacity: 0 },
};

// Inner content: blur-slide flourish. Labels are inherited from the wrapper.
export const rowContentVariants: Variants = {
  initial: { opacity: 0, y: -8, scale: 0.98, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" },
};
