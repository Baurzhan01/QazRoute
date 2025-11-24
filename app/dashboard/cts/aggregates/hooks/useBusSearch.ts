"use client";

import { useEffect, useState } from "react";
import { busService } from "@/service/busService";
import type { BusDepotItem } from "@/types/bus.types";

interface UseBusSearchResult {
  query: string;
  setQuery: (value: string) => void;
  results: BusDepotItem[];
  loading: boolean;
}

export function useBusSearch(depotId?: string | null): UseBusSearchResult {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusDepotItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!depotId || trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await busService.searchByDepot(depotId, trimmed, "1", "15");
        setResults(res.value?.items ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [depotId, query]);

  return { query, setQuery, results, loading };
}
