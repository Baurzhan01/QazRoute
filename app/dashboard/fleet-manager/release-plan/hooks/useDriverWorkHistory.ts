// hooks/useDriverWorkHistory.ts
"use client";

import { useEffect, useState } from "react";
import { driverService, type DriverWorkHistoryItem } from "@/service/driverService";
import { toast } from "@/components/ui/use-toast";

export function useDriverWorkHistory(
  driverId: string | null,
  startDate: string,
  days: number
) {
  const [data, setData] = useState<DriverWorkHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!driverId) { setData([]); return; }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await driverService.getWorkHistory(driverId, startDate, days);
        if (!cancelled) setData(Array.isArray(res) ? res : []);
      } catch {
        if (!cancelled) toast({ title: "Не удалось загрузить историю работы", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [driverId, startDate, days]);

  return { data, loading };
}
