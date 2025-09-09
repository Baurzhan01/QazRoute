"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { busService } from "@/service/busService";
import type { BusDepotItem } from "@/types/bus.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "../components/StatusBadge";
import AddRepairDialog from "../components/AddRepairDialog";

export default function MechanicRepairsEntryPage() {
  const [depotId, setDepotId] = useState<string | null>(null);
  const [items, setItems] = useState<BusDepotItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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
        const res = await busService.getByDepot(depotId, page, pageSize);
        setItems(res.value?.items ?? []);
        setTotalCount(res.value?.totalCount ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId, page, pageSize]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(b =>
      (b.garageNumber || "").toLowerCase().includes(s) ||
      (b.govNumber || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Журнал ремонта — автобусы парка</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Список автобусов</CardTitle>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Поиск по гаражному / гос. номеру…"
              className="w-72"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Показывать:</span>
              <select
                className="border rounded px-2 py-1"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                ←
              </Button>
              <div className="text-sm">
                Стр. <span className="font-medium">{page}</span> из {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                →
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">Ничего не найдено</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Статус</th>
                    <th className="py-2 pr-4">Гаражный №</th>
                    <th className="py-2 pr-4">Гос. номер</th>
                    <th className="py-2 pr-4">Марка/Тип</th>
                    <th className="py-2 pr-4">VIN</th>
                    <th className="py-2 pr-4">Год</th>
                    <th className="py-2 pr-4">Пробег</th>
                    <th className="py-2 pr-4">Водители</th>
                    <th className="py-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="py-2 pr-4"><StatusBadge status={b.busStatus} /></td>
                      <td className="py-2 pr-4">{b.garageNumber ?? "—"}</td>
                      <td className="py-2 pr-4">{b.govNumber ?? "—"}</td>
                      <td className="py-2 pr-4">{b.brand ?? "—"}{b.type ? ` (${b.type})` : ""}</td>
                      <td className="py-2 pr-4">{b.vinCode ?? "—"}</td>
                      <td className="py-2 pr-4">{b.year ?? "—"}</td>
                      <td className="py-2 pr-4">{b.mileage != null ? b.mileage.toLocaleString("ru-RU") : "—"}</td>
                      <td className="py-2 pr-4">{b.drivers?.length ? b.drivers.map(d => d.fullName).join(", ") : "—"}</td>
                      <td className="py-2">
                        <div className="flex gap-3">
                          <Button variant="link" className="px-0" asChild>
                            <Link href={`/dashboard/mechanic/repairs/bus/${b.id}`}>История автобуса</Link>
                          </Button>
                          <AddRepairDialog
                            busId={b.id}
                            trigger={<Button variant="link" className="px-0">Добавить ремонт</Button>}
                            onCreated={() => {
                              window.location.href = `/dashboard/mechanic/repairs/bus/${b.id}`;
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-end gap-2 mt-3">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  ← Предыдущая
                </Button>
                <div className="text-sm">
                  Стр. <span className="font-medium">{page}</span> из {totalPages} ({totalCount} автоб.)
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  Следующая →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
