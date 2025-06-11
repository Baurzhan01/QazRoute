"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { getAuthData } from "@/lib/auth-utils";
import { busService } from "@/service/busService";
import { driverService } from "@/service/driverService";
import { convoyService } from "@/service/convoyService";
import { repairService } from "@/service/repairService";
import { routeExitRepairService } from "@/service/routeExitRepairService";
import { busDepotService } from "@/service/busDepotService";
import { toast } from "@/components/ui/use-toast";
import RepairTableAll from "./components/RepairTableAll";
import RepairTableSingle from "./components/RepairTableSingle";
import EditRepairDialog from "./components/EditRepairDialog";
import { format } from "date-fns";
import type { GroupedRepairsByConvoy, RepairRecord } from "@/types/repair.types";

export default function CTSPlanRepairPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<string>("all");
  const [convoys, setConvoys] = useState<{ id: string; number: number }[]>([]);
  const [repairsByConvoy, setRepairsByConvoy] = useState<GroupedRepairsByConvoy[]>([]);
  const [singleConvoyRepairs, setSingleConvoyRepairs] = useState<RepairRecord[]>([]);
  const [editRecord, setEditRecord] = useState<RepairRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [depotName, setDepotName] = useState<string>("");
  const [repairStats, setRepairStats] = useState<number | null>(null);

  const auth = getAuthData();
  const depotId = auth?.busDepotId || "";
  const formattedDate = useMemo(() => format(date, "yyyy-MM-dd"), [date]);
  const handleError = (msg: string, err?: any) => {
    console.error(msg, err);
    toast({ title: "Ошибка", description: msg, variant: "destructive" });
  };

  const fetchAll = useCallback(async () => {
    if (!depotId) return handleError("Не удалось определить депо");
    setLoading(true);
    try {
      const [depotRes, statsRes, convoysRes, repairsRes] = await Promise.all([
        busDepotService.getById(depotId),
        routeExitRepairService.getStatsByDate(depotId, formattedDate, formattedDate),
        convoyService.getByDepotId(depotId),
        repairService.getRepairsByDepotAndDate(formattedDate, depotId),
      ]);
  
      if (!depotRes.isSuccess || !depotRes.value) throw new Error("Ошибка депо");
      setDepotName(depotRes.value.name);
      setRepairStats(statsRes.isSuccess ? statsRes.value : null);
  
      if (!convoysRes.isSuccess) throw new Error("Ошибка загрузки колонн");
      setConvoys((convoysRes.value ?? []).map(c => ({ id: c.id, number: c.number })));
  
      if (!repairsRes.isSuccess || !Array.isArray(repairsRes.value)) {
        throw new Error("Ошибка загрузки ремонтов");
      }
  
      const grouped: Record<string, GroupedRepairsByConvoy> = {};
  
      for (const group of repairsRes.value) {
        const { convoyId, convoyNumber, repairs } = group;
  
        if (!convoyId || !Array.isArray(repairs)) continue;
  
        if (!grouped[convoyId]) {
          grouped[convoyId] = {
            convoyId,
            convoyNumber,
            repairs: [],
          };
        }
  
        for (const r of repairs) {
          if (!r?.bus || !r?.driver || !r?.description) continue;
  
          grouped[convoyId].repairs.push({
            convoyId,
            convoyNumber,
            number: r.number ?? 0,
            description: r.description,
            bus: r.bus,
            driver: r.driver,
          });
        }
      }
  
      setRepairsByConvoy(Object.values(grouped));
    } catch (e) {
      handleError("Не удалось загрузить данные", e);
    } finally {
      setLoading(false);
    }
  }, [formattedDate, depotId]);
  

  const fetchSingleConvoyRepairs = useCallback(async (convoyId: string) => {
    setLoading(true);
    try {
      const repairsRes = await repairService.getRepairsByDate(formattedDate, convoyId);
      if (!repairsRes.isSuccess) throw new Error();
      const repairs = repairsRes.value ?? [];

      const enriched = await Promise.all(
        repairs.map(async (r) => {
          const [busRes, driverRes] = await Promise.all([
            busService.getById(r.bus.id),
            driverService.getById(r.driver.id)
          ]);
          if (!busRes.isSuccess || !busRes.value || !driverRes.isSuccess || !driverRes.value) return null;
          return {
            ...r,
            convoyId,
            convoyNumber: r.convoyNumber,
            number: r.number,
            description: r.description,
            bus: busRes.value,
            driver: driverRes.value,
          } as RepairRecord;
        })
      );

      setSingleConvoyRepairs(enriched.filter((r): r is RepairRecord => !!r));
    } catch (e) {
      handleError("Не удалось загрузить ремонты колонны", e);
    } finally {
      setLoading(false);
    }
  }, [formattedDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (mode !== "all" && mode !== "") {
      fetchSingleConvoyRepairs(mode);
    }
  }, [mode, fetchSingleConvoyRepairs]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{depotName || "Автобусный парк"}</h1>
      <p className="text-gray-600">На {formattedDate} запланировано {repairStats ?? 0} автобусов.</p>
      {loading && <p className="text-gray-500">Загрузка...</p>}

      <Card className="p-2 w-fit">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && setDate(d)}
          locale={ru}
          fromDate={addDays(new Date(), -5)}
          toDate={addDays(new Date(), 5)}
          aria-label="Выберите дату для просмотра ремонтов"
        />
      </Card>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">Все автоколонны</TabsTrigger>
          {convoys.map(c => (
            <TabsTrigger key={c.id} value={c.id}>Автоколонна №{c.number}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="all">
            <RepairTableAll
              data={repairsByConvoy}
              date={formattedDate}
              onReload={fetchAll}
              onEdit={setEditRecord}
            />
          </TabsContent>

          {convoys.map(c => (
            <TabsContent key={c.id} value={c.id}>
              <RepairTableSingle
                convoyId={c.id}
                date={formattedDate}
                convoyNumber={c.number}
                repairs={singleConvoyRepairs}
                onReload={() => fetchSingleConvoyRepairs(c.id)}
                onEdit={setEditRecord}
                onUpdate={async () => {}}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {editRecord && (
        <EditRepairDialog
          open={true}
          onClose={() => setEditRecord(null)}
          date={formattedDate}
          repair={editRecord}
          onUpdated={async () => {
            await fetchAll();
            if (mode !== "all") await fetchSingleConvoyRepairs(mode);
            setEditRecord(null);
          }}
        />
      )}
    </div>
  );
}
