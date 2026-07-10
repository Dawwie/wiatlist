import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const user = await requireUser();
  const stats = (await sql`
    SELECT lower(trim(i.name)) AS product,
           count(*)::int AS times_added,
           max(i.created_at) AS last_added
    FROM items i
    JOIN list_members m ON m.list_id = i.list_id AND m.user_id = ${user.id}
    GROUP BY 1
    ORDER BY 2 DESC, 3 DESC
    LIMIT 25
  `) as { product: string; times_added: number; last_added: string }[];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Najczęściej kupowane</h1>
      {stats.length === 0 ? (
        <p className="text-sm text-gray-500">
          Brak danych — dodaj pierwsze produkty do listy.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {stats.map((row, index) => (
            <li
              key={row.product}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2"
            >
              <span className="w-6 text-right text-sm text-gray-400">
                {index + 1}.
              </span>
              <span className="flex-1 font-medium">{row.product}</span>
              <span className="text-sm text-gray-500">×{row.times_added}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
