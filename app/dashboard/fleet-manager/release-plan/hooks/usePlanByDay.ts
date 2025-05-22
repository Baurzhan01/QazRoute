"use client";

import { useEffect, useState } from "react";
import { releasePlanService } from "@/service/releasePlanService";
import type { DispatchRoute, ReserveDriver } from "@/types/releasePlanTypes";

interface PlanRoute {
  routeId: string;
  routeNumber: string;
}

interface UsePlanByDayResult {
  routes: PlanRoute[];
  reserves: ReserveDriver[];
}

export function usePlanByDay(
  date: Date,
  convoyId: string,
  depotId: string,
  dayType: string
) {
  const [data, setData] = useState<UsePlanByDayResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const dateStr = date.toISOString().split("T")[0];

      try {
        let dispatchRes;

        try {
          dispatchRes = await releasePlanService.getFullDispatchByDate(dateStr, convoyId);
        } catch (err: any) {
          if (err.response?.status === 404) {
            console.warn("🔁 Разнарядка не найдена — создаём...");
            await releasePlanService.createDispatchRoute(convoyId, dateStr);
            dispatchRes = await releasePlanService.getFullDispatchByDate(dateStr, convoyId);
          } else {
            throw err;
          }
        }

        if (!dispatchRes.isSuccess || !dispatchRes.value) {
          throw new Error("Ошибка получения разнарядки");
        }

        const routes = dispatchRes.value.routes.map((r: DispatchRoute) => ({
          routeId: r.routeId,
          routeNumber: r.routeNumber,
        }));

        const reserves: ReserveDriver[] = dispatchRes.value.reserves ?? [];

        setData({ routes, reserves });
      } catch (err: any) {
        console.error("❌ Ошибка загрузки плана дня:", err);
        setError(err.message || "Не удалось загрузить план выпуска");
      } finally {
        setLoading(false);
      }
    };

    if (convoyId && depotId) load();
  }, [date, convoyId, depotId, dayType]);

  return { data, loading, error };
}
