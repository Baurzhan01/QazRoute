"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthData } from "@/lib/auth-utils";
import { convoyService } from "@/service/convoyService";
import { driverService } from "@/service/driverService";
import { busService } from "@/service/busService";
import { routeService } from "@/service/routeService";
import { getDayType, parseDate } from "../fleet-manager/release-plan/utils/dateUtils";
import type { RouteStatus } from "@/types/route.types";
import { holidays } from "@/app/dashboard/fleet-manager/release-plan/data/holidays";

import type { Convoy } from "@/types/convoy.types";
import SummaryStats from "./components/SummaryStats";
import CriticalAlerts from "./components/CriticalAlerts";
import QuickLinks from "./components/QuickLinks";
import ConvoyGrid from "./components/ConvoyGrid";

interface ConvoySummary {
  id: string;
  number: number;
  driverCount: number;
  busCount: number;
  routeCount: number;
}

export default function DispatcherDashboardPage() {
  const router = useRouter();
  const authData = getAuthData();
  const depotId = authData?.busDepotId || "";
  const role = authData?.role?.toLowerCase() || "";

  const [convoys, setConvoys] = useState<Convoy[]>([]);
  const [summaries, setSummaries] = useState<ConvoySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!depotId) {
      setLoading(false);
      return;
    }

    if (role !== "dispatcher") {
      router.push("/login");
      return;
    }

    const load = async () => {
      try {
        const convoysRes = await convoyService.getByDepotId(depotId);
        if (!convoysRes.isSuccess || !Array.isArray(convoysRes.value)) {
          throw new Error("Ошибка при получении колонн");
        }

        const convoyList = convoysRes.value;
        setConvoys(convoyList);

        const today = new Date();
        const holidayDates = holidays.map((h) => parseDate(h.date));
        const dayType = getDayType(today, holidayDates); // workday | saturday | sunday | holiday

        const allSummaries: ConvoySummary[] = await Promise.all(
          convoyList.map(async (convoy) => {
            try {
              const [driversRes, busesRes, routesRes] = await Promise.all([
                driverService.filter({
                  convoyId: convoy.id,
                  fullName: null,
                  serviceNumber: null,
                  address: null,
                  phone: null,
                  driverStatus: null,
                  page: 1,
                  pageSize: 1,
                }),
                busService.getByConvoy(convoy.id),
                routeService.getByConvoyId(convoy.id),
              ]);

              const statusMap: Record<string, RouteStatus> = {
                workday: "Workday",
                saturday: "Saturday",
                sunday: "Sunday",
                holiday: "Holiday",
              };
              
              const targetStatus = statusMap[dayType];
              
              const dayRoutes = routesRes.value?.filter(r => r.routeStatus === targetStatus) ?? [];
              

              return {
                id: convoy.id,
                number: convoy.number,
                driverCount: driversRes.value?.totalCount ?? 0,
                busCount: Array.isArray(busesRes) ? busesRes.length : 0,
                routeCount: dayRoutes.length,
              };
            } catch {
              return { id: convoy.id, number: convoy.number, driverCount: 0, busCount: 0, routeCount: 0 };
            }
          })
        );

        setSummaries(allSummaries);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки колонн");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [depotId, role, router]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Панель диспетчера</h1>

      {loading && <div className="text-center text-gray-500">Загрузка...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}

      {!loading && summaries.length > 0 && (
        <>
          <SummaryStats summaries={summaries} />
          <CriticalAlerts summaries={summaries} />
          <QuickLinks />
          <ConvoyGrid summaries={summaries} />
        </>
      )}

      {!loading && summaries.length === 0 && (
        <div className="text-gray-500 text-center">Нет доступных колонн</div>
      )}
    </div>
  );
}
