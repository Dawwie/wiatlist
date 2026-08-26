// The Neon driver returns `unknown[]` for every query. These wrappers put the
// row type in one place per call site instead of a hand-written cast, and make
// "exactly one row" / "at most one row" explicit rather than a lying tuple type.

export async function rows<T>(query: Promise<unknown>): Promise<T[]> {
  return (await query) as T[];
}

export async function maybeRow<T>(query: Promise<unknown>): Promise<T | undefined> {
  return ((await query) as T[])[0];
}

export async function row<T>(query: Promise<unknown>): Promise<T> {
  const [first] = (await query) as T[];
  if (first === undefined) throw new Error("Expected exactly one row, got none");
  return first;
}
