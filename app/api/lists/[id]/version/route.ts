import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/users";
import { hasListAccess } from "@/lib/lists";
import { getListVersion } from "@/lib/items";

// Polled by refresh-poller.tsx. Unlike the pages it answers with status codes
// rather than notFound()/redirect(), so it uses the boolean access check.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await hasListAccess(user.id, id))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const v = await getListVersion(id);
  return NextResponse.json({ v }, { headers: { "Cache-Control": "no-store" } });
}
