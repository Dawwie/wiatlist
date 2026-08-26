import { UNITS, DEFAULT_UNIT } from "./units";

// Form values arrive as untrusted strings. A blank, non-numeric or negative
// quantity means "unspecified" (null); an unknown unit falls back to the default.
export function parseQuantityUnit(formData: FormData) {
  const qtyRaw = String(formData.get("quantity") ?? "").trim();
  let quantity: number | null = qtyRaw === "" ? null : Number(qtyRaw);
  if (quantity !== null && (Number.isNaN(quantity) || quantity < 0)) quantity = null;
  const unitRaw = String(formData.get("unit") ?? "");
  const unit = (UNITS as readonly string[]).includes(unitRaw) ? unitRaw : DEFAULT_UNIT;
  return { quantity, unit };
}
