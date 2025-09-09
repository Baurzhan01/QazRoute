"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { repairBusService } from "@/service/repairBusService";
import type { Repair } from "@/types/repairBus.types";

// модалки лежат в mechanic/components
import AddRepairDialog from "../../../components/AddRepairDialog";
import EditRepairDialog from "../../../components/EditRepairDialog";

export default function BusHistoryPage() {
  const { busId } = useParams<{ busId: string }>();
  const router = useRouter();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Repair | null>(null);

  useEffect(() => {
    if (!busId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await repairBusService.getByBusId(busId);
        setRepairs(res.value ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [busId]);

  const header = useMemo(() => {
    const r = repairs[0];
    return { garage: r?.garageNumber ?? "—", gov: r?.govNumber ?? "—" };
  }, [repairs]);

  const onCreated = (created: Repair) => setRepairs(prev => [created, ...prev]);
  const onUpdated = (updated: Repair) => {
    setRepairs(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setEditItem(null);
  };
  const onDelete = async (id: string) => {
    if (!confirm("Удалить запись ремонта?")) return;
    await repairBusService.remove(id);
    setRepairs(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">История ремонтов — {header.garage} / {header.gov}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Назад</Button>
          <AddRepairDialog busId={busId} onCreated={onCreated} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заказ-наряды</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : repairs.length === 0 ? (
            <div className="text-sm text-muted-foreground">Пока записей нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">№ заявки</th>
                    <th className="py-2 pr-4">Работа</th>
                    <th className="py-2 pr-4">З/ч</th>
                    <th className="py-2 pr-4">Сумма</th>
                    <th className="py-2 pr-4">Даты</th>
                    <th className="py-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-4">{r.applicationNumber ?? "—"}</td>
                      <td className="py-2 pr-4">
                        {r.workName || "—"} ({r.workCount} ед., {r.workHour} ч, {r.workPrice} ₸)
                      </td>
                      <td className="py-2 pr-4">
                        {r.sparePart || "—"} ({r.sparePartCount} шт., {r.sparePartPrice} ₸)
                      </td>
                      <td className="py-2 pr-4">{(r.allSum ?? 0).toLocaleString("ru-RU")} ₸</td>
                      <td className="py-2 pr-4">
                        выезд: {r.departureDate === "0001-01-01" ? "—" : r.departureDate}<br/>
                        въезд: {r.entryDate === "0001-01-01" ? "—" : r.entryDate}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-3">
                          <Button variant="link" className="px-0" asChild>
                            <Link href={`/dashboard/mechanic/repairs/${r.id}/print`}>Печать</Link>
                          </Button>
                          <Button variant="link" className="px-0" onClick={() => setEditItem(r)}>Редактировать</Button>
                          <Button variant="link" className="px-0 text-red-600" onClick={() => onDelete(r.id)}>Удалить</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editItem && (
        <EditRepairDialog
          repair={editItem}
          onClose={() => setEditItem(null)}
          onUpdated={onUpdated}
        />
      )}
    </div>
  );
}
