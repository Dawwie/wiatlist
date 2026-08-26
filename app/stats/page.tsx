import { requireUser } from "@/lib/users";
import { getPurchaseStats } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const user = await requireUser();
  const stats = await getPurchaseStats(user.id);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Najczęściej kupowane</h1>
      {stats.length === 0 ? (
        <p className="text-sm text-muted">
          Brak danych — dodaj pierwsze produkty do listy.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {stats.map((row, index) => (
            <li
              key={row.product}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <span className="w-6 text-right text-sm text-muted">
                {index + 1}.
              </span>
              <span className="flex-1 font-medium">{row.product}</span>
              <span className="text-sm text-muted">×{row.timesAdded}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
