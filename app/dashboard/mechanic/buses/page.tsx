"use client";

import { useEffect, useMemo, useState } from "react";
import { busService } from "@/service/busService";
import type { BusDepotItem } from "@/types/bus.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RussianStatusBadge from "../components/RussianStatusBadge";


/** Чип статуса (минималистично, без зависимостей) */
function StatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? "").toLowerCase();
  const map: Record<string, string> = {
    onwork: "bg-emerald-100 text-emerald-800",
    repair: "bg-amber-100 text-amber-800",
    underrepair: "bg-amber-100 text-amber-800",
    longtermrepair: "bg-orange-100 text-orange-800",
    reserve: "bg-slate-100 text-slate-800",
    dayoff: "bg-sky-100 text-sky-800",
    decommissioned: "bg-rose-100 text-rose-800",
  };
  const cls =
    map[s] ??
    "bg-slate-100 text-slate-800";
  const label =
    status ??
    "—";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function MechanicBusesPage() {
  const [depotId, setDepotId] = useState<string | null>(null);
  const [items, setItems] = useState<BusDepotItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // локальный поиск по номеру
  const [q, setQ] = useState("");
  // пагинация
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // вытаскиваем depotId из localStorage (как у тебя в других местах)
  useEffect(() => {
    const auth = localStorage.getItem("authData");
    if (auth) {
      const u = JSON.parse(auth);
      setDepotId(u?.depotId || u?.busDepotId || null);
    }
  }, []);

  // загрузка с сервера по депо и пагинации
  useEffect(() => {
    (async () => {
      if (!depotId) return;
      setLoading(true);
      try {
        // busService.getByDepot ожидает строки для page/pageSize — приведём
        const res = await busService.getByDepot(depotId, String(page), String(pageSize));
        const paged = res.value;
        setItems(paged?.items ?? []);
        setTotalCount(paged?.totalCount ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId, page, pageSize]);

  // клиентский фильтр по гаражному/гос. номеру
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
        <h1 className="text-2xl font-semibold">Автобусы парка</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Список автобусов</CardTitle>

          <div className="flex gap-3 items-center">
            <div className="text-sm text-muted-foreground">
              Всего: <span className="font-medium">{totalCount}</span>
            </div>

            <Input
              placeholder="Поиск по гаражному / гос. номеру…"
              className="w-72"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />

            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">На странице:</span>
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
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                ←
              </Button>
              <div className="text-sm">
                Стр. <span className="font-medium">{page}</span> из {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
                    <th className="py-2 pr-4">Марка / Тип</th>
                    <th className="py-2 pr-4">VIN</th>
                    <th className="py-2 pr-4">Год</th>
                    <th className="py-2 pr-4">Пробег</th>
                    <th className="py-2">Профиль</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="py-4 px-4 border-r border-gray-200">
                        <RussianStatusBadge status={b.busStatus} />
                      </td>
                      <td className="py-2 pr-4">{b.garageNumber ?? "—"}</td>
                      <td className="py-2 pr-4">{b.govNumber ?? "—"}</td>
                      <td className="py-2 pr-4">
                        {b.brand ?? "—"}{b.type ? ` (${b.type})` : ""}
                      </td>
                      <td className="py-2 pr-4">{b.vinCode ?? "—"}</td>
                      <td className="py-2 pr-4">{b.year ?? "—"}</td>
                      <td className="py-2 pr-4">
                        {b.mileage != null ? b.mileage.toLocaleString("ru-RU") : "—"}
                      </td>
                      <td className="py-2">
                        <Link
                          className="text-sky-600 hover:underline"
                          href={`/dashboard/mechanic/repairs/bus/${b.id}`}
                        >
                          История ремонтов
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Пагинация снизу для удобства */}
              <div className="flex items-center justify-end gap-2 mt-3">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  ← Предыдущая
                </Button>
                <div className="text-sm">
                  Стр. <span className="font-medium">{page}</span> из {totalPages} ({totalCount} автоб.)
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
