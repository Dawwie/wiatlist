export const UNITS = ["szt", "g", "kg", "ml", "l"] as const;
export type Unit = (typeof UNITS)[number];
export const DEFAULT_UNIT: Unit = "szt";
