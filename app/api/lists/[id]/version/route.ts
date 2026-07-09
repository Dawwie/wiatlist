import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const [{ v }] = (await sql`
    SELECT (extract(epoch from coalesce(max(updated_at), to_timestamp(0))) * 1000)::bigint::text AS v
    FROM items WHERE list_id = ${id}
  `) as [{ v: string }];
  return NextResponse.json({ v }, { headers: { "Cache-Control": "no-store" } });
}
