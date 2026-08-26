import { describe, expect, it } from "vitest";
import { parseQuantityUnit } from "./form";
import { DEFAULT_UNIT } from "./units";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

describe("parseQuantityUnit", () => {
  it("reads a numeric quantity and a known unit", () => {
    expect(parseQuantityUnit(form({ quantity: "2.5", unit: "kg" }))).toEqual({
      quantity: 2.5,
      unit: "kg",
    });
  });

  it.each([
    ["missing", {}],
    ["empty", { quantity: "" }],
    ["whitespace", { quantity: "   " }],
    ["non-numeric", { quantity: "dwa" }],
    ["negative", { quantity: "-1" }],
  ])("treats a %s quantity as unspecified", (_label, fields) => {
    expect(parseQuantityUnit(form(fields)).quantity).toBeNull();
  });

  it("accepts zero as a real quantity", () => {
    expect(parseQuantityUnit(form({ quantity: "0" })).quantity).toBe(0);
  });

  it.each([
    ["missing", {}],
    ["unknown", { unit: "funt" }],
    ["wrong case", { unit: "KG" }],
  ])("falls back to the default unit when the unit is %s", (_label, fields) => {
    expect(parseQuantityUnit(form(fields)).unit).toBe(DEFAULT_UNIT);
  });
});
