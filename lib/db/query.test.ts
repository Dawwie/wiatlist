import { describe, expect, it } from "vitest";
import { maybeRow, row, rows } from "./query";

type Row = { id: string };

describe("row", () => {
  it("returns the first row", async () => {
    await expect(row<Row>(Promise.resolve([{ id: "a" }, { id: "b" }]))).resolves.toEqual({
      id: "a",
    });
  });

  it("throws when the query returned nothing", async () => {
    await expect(row<Row>(Promise.resolve([]))).rejects.toThrow(
      "Expected exactly one row, got none",
    );
  });
});

describe("maybeRow", () => {
  it("returns the first row when there is one", async () => {
    await expect(maybeRow<Row>(Promise.resolve([{ id: "a" }]))).resolves.toEqual({ id: "a" });
  });

  it("returns undefined for an empty result", async () => {
    await expect(maybeRow<Row>(Promise.resolve([]))).resolves.toBeUndefined();
  });
});

describe("rows", () => {
  it("passes the whole result through", async () => {
    await expect(rows<Row>(Promise.resolve([{ id: "a" }]))).resolves.toEqual([{ id: "a" }]);
  });
});
