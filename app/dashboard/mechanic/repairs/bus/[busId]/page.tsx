"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { repairBusService } from "@/service/repairBusService";
import { busService } from "@/service/busService";

import type { Repair } from "@/types/repairBus.types";
import type { Bus } from "@/types/bus.types";

import AddRepairDialog from "../../../components/AddRepairDialog";
import EditRepairDialog from "../../../components/EditRepairDialog";

function fmtDate(s?: string) {
  if (!s || s === "0001-01-01") return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ru-RU");
}

function safeSum(n?: number | null, fallback = 0) {
  return n ?? fallback;
}

export default function BusHistoryPage() {
  const { busId } = useParams<{ busId: string }>();
  const router = useRouter();

  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Repair | null>(null);

  const [bus, setBus] = useState<Bus | null>(null);
  const [appSearch, setAppSearch] = useState("");

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

  useEffect(() => {
    reload();
  }, [reload]);

  const header = useMemo(() => {
    const r = repairs[0];
    return { garage: r?.garageNumber ?? "—", gov: r?.govNumber ?? "—" };
  }, [repairs]);

  const visibleRepairs = useMemo(() => {
    const q = appSearch.trim();
    if (!q) return repairs;
    return repairs.filter((r) =>
      String(r.applicationNumber ?? "").includes(q)
    );
  }, [repairs, appSearch]);

  const grouped = useMemo(() => {
    const map = new Map<number, Repair[]>();
    for (const r of visibleRepairs) {
      const key = r.applicationNumber ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [visibleRepairs]);

  // === Итоговые расходы на автобус ===
  const totals = useMemo(() => {
    let workTotal = 0;
    let partsTotal = 0;
    let allTotal = 0;

    for (const r of repairs) {
      workTotal += safeSum(r.workSum, (r.workHour ?? 0) * (r.workPrice ?? 0));
      partsTotal += safeSum(
        r.sparePartSum,
        (r.sparePartCount ?? 0) * (r.sparePartPrice ?? 0)
      );
      allTotal += safeSum(r.allSum, 0);
    }

    return { workTotal, partsTotal, allTotal };
  }, [repairs]);

  const onCreated = async (_created: Repair[]) => {
    setRepairs((prev) => [..._created, ...prev]);
    await reload();
  };

  const onUpdated = async (updated: Repair) => {
    setRepairs((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditItem(null);
    await reload();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Удалить запись ремонта?")) return;
    await repairBusService.remove(id);
    setRepairs((prev) => prev.filter((r) => r.id !== id));
    await reload();
  };

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          История ремонтов — {header.garage} / {header.gov}
        </h1>

        <div className="flex items-center gap-2">
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

      {/* Паспорт автобуса */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-2">
          <CardTitle className="text-base font-semibold">Информация об автобусе</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Левая часть — паспорт */}
            <div className="border rounded-md p-4 bg-slate-50 h-full">
              <div className="text-sm text-muted-foreground mb-3">Паспорт автобуса</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">VIN-код</div>
                  <div className="font-medium">{bus?.vinCode || "—"}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Марка</div>
                  <div className="font-medium">{bus?.brand || "—"} {bus?.type ? `(${bus.type})` : ""}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Год выпуска</div>
                  <div className="font-medium">{bus?.year ?? "—"}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Тип</div>
                  <div className="font-medium">{bus?.type || "—"}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Гаражный №</div>
                  <div className="font-bold text-blue-600">{bus?.garageNumber || header.garage}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Госномер</div>
                  <div className="font-bold text-green-600">{bus?.govNumber || header.gov}</div>
                </div>
                <div className="rounded-md border bg-white p-3 col-span-2">
                  <div className="text-xs text-muted-foreground">Пробег</div>
                  <div className="font-medium">
                    {bus?.mileage != null ? bus.mileage.toLocaleString("ru-RU") + " км" : "—"}
                  </div>
                </div>
              </div>
            </div>
            {/* Правая часть — расходы */}
            <div className="border rounded-md p-4 bg-slate-50 h-full">
              <div className="text-sm text-muted-foreground mb-3">Расходы на обслуживание</div>
              {/* Карточки с суммами */}
              <div className="grid sm:grid-cols-3 gap-3 text-sm mb-6">
                <div className="rounded-md border p-2 bg-white flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Работы</span>
                  <span className="font-semibold text-blue-600">
                    {totals.workTotal.toLocaleString("ru-RU")} ₸
                  </span>
                </div>
                <div className="rounded-md border p-2 bg-white flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Запчасти</span>
                  <span className="font-semibold text-amber-600">
                    {totals.partsTotal.toLocaleString("ru-RU")} ₸
                  </span>
                </div>
                <div className="rounded-md border p-2 bg-white flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Всего</span>
                  <span className="font-bold text-green-700">
                    {totals.allTotal.toLocaleString("ru-RU")} ₸
                  </span>
                </div>
              </div>

              {/* Диаграмма */}
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Работы", value: totals.workTotal },
                      { name: "Запчасти", value: totals.partsTotal },
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(val: number) => `${val.toLocaleString("ru-RU")} ₸`} />
                    <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Заказ-наряды */}
      <Card>
        <CardHeader>
          <CardTitle>Заказ-наряды</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : grouped.length === 0 ? (
            <div className="text-sm text-muted-foreground">Пока записей нет</div>
          ) : (
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

                const totalSum = group.reduce(
                  (s, x) => s + safeSum(x.allSum, 0),
                  0
                );

                const dep = fmtDate(group[0]?.departureDate);
                const ent = fmtDate(group[0]?.entryDate);

                return (
                  <div key={`app-${appNum}`} className="border rounded-lg overflow-hidden">
                    {/* Шапка */}
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

                    {/* Запчасти */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-left text-muted-foreground">
                            <th className="p-2 border">№</th>
                            <th className="p-2 border">Артикул</th>
                            <th className="p-2 border">Наименование</th>
                            <th className="p-2 border text-right">Кол-во</th>
                            <th className="p-2 border text-right">Цена</th>
                            <th className="p-2 border text-right">Сумма</th>
                            <th className="p-2 border text-right">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parts.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-2 text-center text-muted-foreground border">—</td>
                            </tr>
                          ) : (
                            parts.map((p, idx) => (
                              <tr key={`${p.id}-part`} className="border-t">
                                <td className="p-2 border text-center">{idx + 1}</td>
                                <td className="p-2 border">{p.sparePartArticle || "—"}</td>
                                <td className="p-2 border">{p.sparePart}</td>
                                <td className="p-2 border text-right">{safeSum(p.sparePartCount, 0)}</td>
                                <td className="p-2 border text-right">
                                  {safeSum(p.sparePartPrice, 0).toLocaleString("ru-RU")}
                                </td>
                                <td className="p-2 border text-right">
                                  {safeSum(
                                    p.sparePartSum,
                                    safeSum(p.sparePartCount, 0) * safeSum(p.sparePartPrice, 0)
                                  ).toLocaleString("ru-RU")}
                                </td>
                                <td className="p-2 border text-right">
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="link" className="h-6 px-1 text-xs" onClick={() => setEditItem(p)}>✏️</Button>
                                    <Button variant="link" className="h-6 px-1 text-xs text-red-600" onClick={() => onDelete(p.id)}>🗑</Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="border-t font-medium bg-slate-50">
                            <td className="p-2 border text-right" colSpan={5}>Итого по запчастям</td>
                            <td className="p-2 border text-right">{partsSum.toLocaleString("ru-RU")}</td>
                            <td className="p-2 border"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Работы */}
                    <div className="overflow-x-auto mt-6">
                      <table className="w-full text-sm border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-left text-muted-foreground">
                            <th className="p-2 border">№</th>
                            <th className="p-2 border">Код операции</th>
                            <th className="p-2 border">Наименование работы</th>
                            <th className="p-2 border text-right">Кол-во</th>
                            <th className="p-2 border text-right">Часы</th>
                            <th className="p-2 border text-right">Цена</th>
                            <th className="p-2 border text-right">Сумма</th>
                            <th className="p-2 border text-right">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {works.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-2 text-center text-muted-foreground border">—</td>
                            </tr>
                          ) : (
                            works.map((w, idx) => (
                              <tr key={`${w.id}-work`} className="border-t">
                                <td className="p-2 border text-center">{idx + 1}</td>
                                <td className="p-2 border">{w.workCode || "—"}</td>
                                <td className="p-2 border">{w.workName}</td>
                                <td className="p-2 border text-right">{safeSum(w.workCount, 0)}</td>
                                <td className="p-2 border text-right">{safeSum(w.workHour, 0)}</td>
                                <td className="p-2 border text-right">
                                  {safeSum(w.workPrice, 0).toLocaleString("ru-RU")}
                                </td>
                                <td className="p-2 border text-right">
                                  {safeSum(
                                    w.workSum,
                                    safeSum(w.workHour, 0) * safeSum(w.workPrice, 0)
                                  ).toLocaleString("ru-RU")}
                                </td>
                                <td className="p-2 border text-right">
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="link" className="h-6 px-1 text-xs" onClick={() => setEditItem(w)}>✏️</Button>
                                    <Button variant="link" className="h-6 px-1 text-xs text-red-600" onClick={() => onDelete(w.id)}>🗑</Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="border-t font-medium bg-slate-50">
                            <td className="p-2 border text-right" colSpan={6}>Итого по работам</td>
                            <td className="p-2 border text-right">{worksSum.toLocaleString("ru-RU")}</td>
                            <td className="p-2 border"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
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
