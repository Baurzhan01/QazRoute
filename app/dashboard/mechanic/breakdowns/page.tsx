"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthData } from "@/lib/auth-utils";
import { toast } from "@/components/ui/use-toast";
import { routeExitRepairService } from "@/service/routeExitRepairService";
import { repairBusService } from "@/service/repairBusService";
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types";
import type { Repair } from "@/types/repairBus.types";

import LRTBreakdownTable from "./components/LRTBreakdownTable";

type OrderIndex = Record<string, { applicationNumber: number | string; id: string }>;

function ymd(s?: string | null): string | null {
  if (!s) return null;
  if (s.length >= 10) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export default function MechanicBreakdownsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([]);
  const [orderIndex, setOrderIndex] = useState<OrderIndex>({});
  const [loading, setLoading] = useState(false);

  const depotId = getAuthData()?.busDepotId;
  const dateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  const fetchData = useCallback(async () => {
    if (!depotId) return;
    setLoading(true);
    try {
      // 1) Сходы (неплановые)
      const [breakdownsRes, repairListRes] = await Promise.all([
        routeExitRepairService.getByDate(dateStr, depotId),
        repairBusService.getByDepotId(depotId), // возьмём все по колонне и отфильтруем за день
      ]);

      // Таблица сходов
      if (breakdownsRes?.isSuccess && Array.isArray(breakdownsRes.value)) {
        setRepairs(
          breakdownsRes.value.filter((r: RouteExitRepairDto) => r.repairType === "Unscheduled")
        );
      } else {
        setRepairs([]);
        toast({ title: "Ошибка загрузки сходов", variant: "destructive" });
      }

      // Индекс заказов на выбранную дату по автобусу
      const list: Repair[] = Array.isArray(repairListRes?.value) ? repairListRes.value : [];
      const sameDayRepairs = list.filter((r) => {
        const day =
          ymd(r.createdAt) || ymd((r as any).departureDate) || ymd((r as any).entryDate);
        return day === dateStr;
      });

      // Ключ: busId|YYYY-MM-DD. Берём самый "поздний" по createdAt на всякий случай
      const tmp: Record<
        string,
        { applicationNumber: number | string; id: string; t: number }
      > = {};

      for (const r of sameDayRepairs) {
        // busId может быть в r.busId; если нет — можно попытаться маппиться по гос/гаражному, но начинём с busId
        const busId = (r as any).busId || (r as any).bus?.id; // подстрахуемся
        if (!busId) continue;

        const key = `${busId}|${dateStr}`;
        const app = r.applicationNumber ?? "—";
        const t = r.createdAt ? Date.parse(r.createdAt) : 0;
        if (!tmp[key] || t > tmp[key].t) {
          tmp[key] = { applicationNumber: app, id: r.id, t };
        }
      }

      const idx: OrderIndex = {};
      for (const k in tmp) idx[k] = { applicationNumber: tmp[k].applicationNumber, id: tmp[k].id };
      setOrderIndex(idx);
    } catch {
      setRepairs([]);
      setOrderIndex({});
      toast({ title: "Не удалось получить данные", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [dateStr, depotId]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000); // автообновление
    return () => clearInterval(id);
  }, [fetchData]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Дата</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Выберите день, за который нужно показать сходы (неплановые ремонты)
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Обновить
          </Button>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full md:w-[260px] justify-start text-left font-normal")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : "Выберите дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сходы с линии (неплановые ремонты)</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            За {format(selectedDate, "dd.MM.yyyy", { locale: ru })}:{" "}
            {loading ? "загрузка…" : repairs.length}
          </p>
        </CardHeader>
        <CardContent>
          {loading && repairs.length === 0 ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : (
            <LRTBreakdownTable repairs={repairs} orderIndex={orderIndex} dateStr={dateStr} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
