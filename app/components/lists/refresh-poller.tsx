"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function RefreshPoller({
  listId,
  initialVersion,
  intervalMs = 4000,
}: {
  listId: string;
  initialVersion: string;
  intervalMs?: number;
}) {
  const router = useRouter();
  const lastVersion = useRef(initialVersion);

  // Keep the baseline in sync after our own mutations re-render the page,
  // so the next poll doesn't trigger a redundant refresh.
  useEffect(() => {
    lastVersion.current = initialVersion;
  }, [initialVersion]);

  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/lists/${listId}/version`, { cache: "no-store" });
        if (!res.ok) return;
        const { v } = await res.json();
        if (v !== lastVersion.current) {
          lastVersion.current = v;
          router.refresh();
        }
      } catch {}
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, listId, intervalMs]);

  return null;
}
