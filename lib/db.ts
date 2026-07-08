import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | undefined;

// Lazy init so the build doesn't require DATABASE_URL at import time.
export const sql: NeonQueryFunction<false, false> = ((
  ...args: Parameters<NeonQueryFunction<false, false>>
) => {
  client ??= neon(process.env.DATABASE_URL!);
  return client(...args);
}) as NeonQueryFunction<false, false>;
