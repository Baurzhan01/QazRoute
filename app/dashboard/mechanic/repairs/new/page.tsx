// app/dashboard/mechanic/repairs/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { busService } from "@/service/busService";
import type { BusDepotItem } from "@/types/bus.types";
import type { ApiResponse } from "@/types/repairBus.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddRepairDialog from "../../components/AddRepairDialog";

export default function MechanicCreateRepairPage() {
  const router = useRouter();
  const [depotId, setDepotId] = useState<string | null>(null);
  const [buses, setBuses] = useState<BusDepotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("authData");
    if (auth) {
      const u = JSON.parse(auth);
      setDepotId(u?.depotId || u?.busDepotId || null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!depotId) return;
      setLoading(true);
      try {
        // берём побольше, чтобы поиск был «локальным» без доп. запросов
        const res = await busService.getByDepot(depotId, 1, 100);
            setBuses(res.value?.items ?? []);
            // если нужно totalCount:
            const total = res.value?.totalCount ?? 0;
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return buses;
    return buses.filter(b =>
      (b.garageNumber || "").toLowerCase().includes(s) ||
      (b.govNumber || "").toLowerCase().includes(s)
    );
  }, [buses, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Создать ремонт</h1>
        <Button variant="outline" onClick={() => router.back()}>Назад</Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Выберите автобус</CardTitle>
          <Input
            placeholder="Поиск по гаражному / гос. номеру…"
            className="w-80"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">Ничего не найдено</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">Выбор</th>
                      <th className="py-2 pr-4">Гаражный №</th>
                      <th className="py-2 pr-4">Гос. номер</th>
                      <th className="py-2 pr-4">Марка/Тип</th>
                      <th className="py-2 pr-4">VIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id} className="border-t">
                        <td className="py-2 pr-4">
                          <input
                            type="radio"
                            name="bus"
                            value={b.id}
                            checked={selectedBusId === b.id}
                            onChange={() => setSelectedBusId(b.id)}
                          />
                        </td>
                        <td className="py-2 pr-4">{b.garageNumber ?? "—"}</td>
                        <td className="py-2 pr-4">{b.govNumber ?? "—"}</td>
                        <td className="py-2 pr-4">
                          {b.brand ?? "—"}{b.type ? ` (${b.type})` : ""}
                        </td>
                        <td className="py-2 pr-4">{b.vinCode ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {/* диалог с подставленным busId */}
                <AddRepairDialog
                  busId={selectedBusId ?? ""}
                  trigger={<Button disabled={!selectedBusId}>Заполнить заказ-наряд</Button>}
                  onCreated={(created) => {
                    // после создания переходим в историю выбранного автобуса
                    window.location.href = `/dashboard/mechanic/repairs/bus/${created.busId}`;
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedBusId) {
                      window.location.href = `/dashboard/mechanic/repairs/bus/${selectedBusId}`;
                    }
                  }}
                  disabled={!selectedBusId}
                >
                  Открыть историю автобуса
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
