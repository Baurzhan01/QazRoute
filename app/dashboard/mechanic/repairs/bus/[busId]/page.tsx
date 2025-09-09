"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { repairBusService } from "@/service/repairBusService";
import { busService } from "@/service/busService";

import type { Repair } from "@/types/repairBus.types";
import type { Bus } from "@/types/bus.types";

import AddRepairDialog from "../../../components/AddRepairDialog";
import EditRepairDialog from "../../../components/EditRepairDialog";

/** Форматтер даты YYYY-MM-DD -> DD.MM.YYYY (или "—") */
function fmtDate(s?: string) {
  if (!s || s === "0001-01-01") return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ru-RU");
}

/** Безопасная сумма (исключаем смешивание ?? и ||) */
function safeSum(n?: number | null, fallback = 0) {
  return n ?? fallback;
}

export default function BusHistoryPage() {
  const { busId } = useParams<{ busId: string }>();
  const router = useRouter();

  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Repair | null>(null);

  // карточка автобуса
  const [bus, setBus] = useState<Bus | null>(null);

  // поиск по № заявки
  const [appSearch, setAppSearch] = useState("");

  // ====== единый рефетч ======
  const reload = useCallback(async () => {
    if (!busId) return;
    setLoading(true);
    try {
      const [rep, busRes] = await Promise.all([
        repairBusService.getByBusId(busId),
        busService.getById(busId),
      ]);
      setRepairs(rep.value ?? []);
      setBus(busRes.value ?? null);
    } finally {
      setLoading(false);
    }
  }, [busId]);

  // первичная загрузка
  useEffect(() => {
    reload();
  }, [reload]);

  // заголовок из первой записи
  const header = useMemo(() => {
    const r = repairs[0];
    return { garage: r?.garageNumber ?? "—", gov: r?.govNumber ?? "—" };
  }, [repairs]);

  // фильтрация по поиску (№ заявки)
  const visibleRepairs = useMemo(() => {
    const q = appSearch.trim();
    if (!q) return repairs;
    return repairs.filter((r) => String(r.applicationNumber ?? "").includes(q));
  }, [repairs, appSearch]);

  // группировка по № заявки
  const grouped = useMemo(() => {
    const map = new Map<number, Repair[]>();
    for (const r of visibleRepairs) {
      const key = r.applicationNumber ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    // сортировка по номеру заявки (по убыванию)
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [visibleRepairs]);

  // ====== CRUD коллбеки ======
  const onCreated = async (_created: Repair[]) => {
    // Оптимистично покажем сразу:
    setRepairs((prev) => [..._created, ...prev]);
    // А затем подтянем «каноничные» данные с бэка (точные суммы/поля):
    await reload();
  };

  const onUpdated = async (updated: Repair) => {
    setRepairs((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditItem(null);
    // Чтобы суммы/агрегации точно совпали с бэком:
    await reload();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Удалить запись ремонта?")) return;
    await repairBusService.remove(id);
    setRepairs((prev) => prev.filter((r) => r.id !== id));
    await reload();
  };

  // ====== JSX ======
  return (
    <div className="space-y-5">
      {/* Верхняя линия: заголовок + действия */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          История ремонтов — {header.garage} / {header.gov}
        </h1>

        <div className="flex items-center gap-2">
          {/* Поиск по № заявки */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Поиск по № заявки</span>
            <Input
              className="w-40"
              placeholder="Напр. 5136"
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
            />
          </div>

          <Button variant="outline" onClick={() => router.back()}>
            Назад
          </Button>

          <AddRepairDialog busId={busId} onCreated={onCreated} />
        </div>
      </div>

      {/* Карточка автобуса */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">VIN-код</div>
              <div className="font-medium">{bus?.vinCode || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Марка автобуса</div>
              <div className="font-medium">
                {bus?.brand || "—"} {bus?.type ? `(${bus.type})` : ""}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Тип</div>
              <div className="font-medium">{bus?.type || "—"}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Год выпуска</div>
              <div className="font-medium">{bus?.year ?? "—"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Госномер</div>
              <div className="font-medium">{bus?.govNumber || header.gov}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Гаражный №</div>
              <div className="font-medium">{bus?.garageNumber || header.garage}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Текущий пробег</div>
              <div className="font-medium">
                {bus?.mileage != null ? bus.mileage.toLocaleString("ru-RU") + " км" : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Заказ-наряды */}
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Заказ-наряды</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : grouped.length === 0 ? (
            <div className="text-sm text-muted-foreground">Пока записей нет</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="space-y-8">
                {grouped.map(([appNum, group]) => {
                  const parts = group.filter((g) => (g.sparePart ?? "").trim() !== "");
                  const works = group.filter((g) => (g.workName ?? "").trim() !== "");

                  const partsSum = parts.reduce((s, x) => {
                    const cnt = safeSum(x.sparePartCount, 0);
                    const price = safeSum(x.sparePartPrice, 0);
                    return s + safeSum(x.sparePartSum, cnt * price);
                  }, 0);

                  const worksSum = works.reduce((s, x) => {
                    const hour = safeSum(x.workHour, 0);
                    const price = safeSum(x.workPrice, 0);
                    return s + safeSum(x.workSum, hour * price);
                  }, 0);

                  const totalSum = group.reduce((s, x) => s + safeSum(x.allSum, 0), 0);

                  const dep = fmtDate(group[0]?.departureDate);
                  const ent = fmtDate(group[0]?.entryDate);

                  return (
                    <div key={`app-${appNum}`} className="border rounded-lg overflow-hidden">
                      {/* Шапка группы */}
                      <div className="flex flex-wrap items-center justify-between bg-slate-50 px-4 py-3 border-b">
                        <div className="text-sm">
                          <div className="font-semibold">Заказ-наряд № {appNum || "—"}</div>
                          <div className="text-muted-foreground">
                            выезд: {dep} &nbsp;·&nbsp; въезд: {ent}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Всего к оплате:</span>{" "}
                            <span className="font-semibold">{totalSum.toLocaleString("ru-RU")} ₸</span>
                          </div>
                          <Button variant="link" className="px-0" asChild>
                            <Link href={`/dashboard/mechanic/repairs/${group[0].id}/print`}>Печать</Link>
                          </Button>
                        </div>
                      </div>

                      {/* Две таблицы: Запчасти / Работы */}
                      <div className="grid md:grid-cols-2 gap-px bg-slate-200">
                        {/* Запчасти */}
                        <div className="bg-white">
                          <div className="px-3 py-2 text-sm font-semibold border-b">
                            Информация по запасным частям
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-50 text-left text-muted-foreground">
                                  <th className="p-2">Наименование</th>
                                  <th className="p-2 text-right w-20">Кол-во</th>
                                  <th className="p-2 text-right w-28">Цена</th>
                                  <th className="p-2 text-right w-28">Сумма</th>
                                  <th className="p-2 text-right">Действия</th>
                                </tr>
                              </thead>
                              <tbody>
                                {parts.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="p-2 text-muted-foreground">
                                      —
                                    </td>
                                  </tr>
                                ) : (
                                  parts.map((p) => (
                                    <tr key={`${p.id}-part`} className="border-t">
                                      <td className="p-2">{p.sparePart}</td>
                                      <td className="p-2 text-right">{safeSum(p.sparePartCount, 0)}</td>
                                      <td className="p-2 text-right">
                                        {safeSum(p.sparePartPrice, 0).toLocaleString("ru-RU")}
                                      </td>
                                      <td className="p-2 text-right">
                                        {safeSum(
                                          p.sparePartSum,
                                          safeSum(p.sparePartCount, 0) * safeSum(p.sparePartPrice, 0)
                                        ).toLocaleString("ru-RU")}
                                      </td>
                                      <td className="p-2 text-right">
                                        <div className="flex gap-2 justify-end">
                                          <Button
                                            variant="link"
                                            className="h-6 px-1 text-xs"
                                            onClick={() => setEditItem(p)}
                                          >
                                            ✏️
                                          </Button>
                                          <Button
                                            variant="link"
                                            className="h-6 px-1 text-xs text-red-600"
                                            onClick={() => onDelete(p.id)}
                                          >
                                            🗑
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                              <tfoot>
                                <tr className="border-t font-medium">
                                  <td className="p-2" colSpan={4}>
                                    Итого по запчастям
                                  </td>
                                  <td className="p-2 text-right">{partsSum.toLocaleString("ru-RU")}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {/* Работы */}
                        <div className="bg-white">
                          <div className="px-3 py-2 text-sm font-semibold border-b">
                            Информация по нормо-часам
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-50 text-left text-muted-foreground">
                                  <th className="p-2">Наименование работы</th>
                                  <th className="p-2 text-right w-20">Кол-во</th>
                                  <th className="p-2 text-right w-20">Часы</th>
                                  <th className="p-2 text-right w-28">Цена</th>
                                  <th className="p-2 text-right w-28">Сумма</th>
                                  <th className="p-2 text-right">Действия</th>
                                </tr>
                              </thead>
                              <tbody>
                                {works.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="p-2 text-muted-foreground">
                                      —
                                    </td>
                                  </tr>
                                ) : (
                                  works.map((w) => (
                                    <tr key={`${w.id}-work`} className="border-t">
                                      <td className="p-2">{w.workName}</td>
                                      <td className="p-2 text-right">{safeSum(w.workCount, 0)}</td>
                                      <td className="p-2 text-right">{safeSum(w.workHour, 0)}</td>
                                      <td className="p-2 text-right">
                                        {safeSum(w.workPrice, 0).toLocaleString("ru-RU")}
                                      </td>
                                      <td className="p-2 text-right">
                                        {safeSum(
                                          w.workSum,
                                          safeSum(w.workHour, 0) * safeSum(w.workPrice, 0)
                                        ).toLocaleString("ru-RU")}
                                      </td>
                                      <td className="p-2 text-right">
                                        <div className="flex gap-2 justify-end">
                                          <Button
                                            variant="link"
                                            className="h-6 px-1 text-xs"
                                            onClick={() => setEditItem(w)}
                                          >
                                            ✏️
                                          </Button>
                                          <Button
                                            variant="link"
                                            className="h-6 px-1 text-xs text-red-600"
                                            onClick={() => onDelete(w.id)}
                                          >
                                            🗑
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                              <tfoot>
                                <tr className="border-t font-medium">
                                  <td className="p-2" colSpan={5}>
                                    Итого по работам
                                  </td>
                                  <td className="p-2 text-right">{worksSum.toLocaleString("ru-RU")}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* модалка редактирования одной записи */}
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
