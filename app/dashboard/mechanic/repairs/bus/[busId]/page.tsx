"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { repairBusService } from "@/service/repairBusService";
import { busService } from "@/service/busService";

import type { Repair, PagedResult } from "@/types/repairBus.types";
import type { Bus } from "@/types/bus.types";

import AddRepairDialog from "../../../components/AddRepairDialog";
import EditRepairDialog from "../../../components/EditRepairDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const searchParams = useSearchParams();

  const appNumParam = searchParams.get("appNum") || "";

  const [repairsPaged, setRepairsPaged] = useState<PagedResult<Repair>>({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    items: [],
    totalAllSum: 0,
    totalWorkSum: 0,
    totalSpareSum: 0,
  });
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Repair | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ appNum: number; repairs: Repair[] } | null>(null);
  const [editAppNum, setEditAppNum] = useState<string>("");
  const [editDeparture, setEditDeparture] = useState<string>("");
  const [editEntry, setEditEntry] = useState<string>("");
  const [editRegister, setEditRegister] = useState<string>(""); // 👈 добавлено
  const [savingGroup, setSavingGroup] = useState(false);

  const [bus, setBus] = useState<Bus | null>(null);
  const [appSearch, setAppSearch] = useState(appNumParam);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  // === reload ===
  const reload = useCallback(async () => {
    if (!busId) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize };
      if (appSearch.trim()) {
        params.appNum = appSearch.trim();
      }

      const [rep, busRes] = await Promise.all([
        repairBusService.getByBusId(busId, params),
        busService.getById(busId),
      ]);

      const value = (rep?.value as PagedResult<Repair>) ?? {
        page: 1,
        pageSize,
        totalCount: 0,
        items: [],
        totalAllSum: 0,
        totalWorkSum: 0,
        totalSpareSum: 0,
      };

      setRepairsPaged(value);
      setBus(busRes.value ?? null);
    } finally {
      setLoading(false);
    }
  }, [busId, page, pageSize, appSearch]);

  useEffect(() => {
    reload();
  }, [reload]);

  // обновляем query при изменении поиска
  useEffect(() => {
    if (appSearch) {
      const qs = new URLSearchParams({ appNum: appSearch }).toString();
      router.replace(`?${qs}`);
    } else {
      router.replace(``);
    }
  }, [appSearch, router]);

  const header = useMemo(() => {
    const r = repairsPaged.items[0];
    return { garage: r?.garageNumber ?? "—", gov: r?.govNumber ?? "—" };
  }, [repairsPaged]);

  const visibleRepairs = useMemo(() => {
    const q = appSearch.trim();
    if (!q) return repairsPaged.items;
    return repairsPaged.items.filter((r) =>
      String(r.applicationNumber ?? "").includes(q)
    );
  }, [repairsPaged, appSearch]);

  const grouped = useMemo(() => {
    const map = new Map<number, Repair[]>();
    for (const r of visibleRepairs) {
      const key = r.applicationNumber ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [visibleRepairs]);

  const totals = useMemo(() => {
    return {
      workTotal: repairsPaged.totalWorkSum ?? 0,
      partsTotal: repairsPaged.totalSpareSum ?? 0,
      allTotal: repairsPaged.totalAllSum ?? 0,
    };
  }, [repairsPaged]);

  const onCreated = async () => {
    await reload();
  };

  const onUpdated = async () => {
    setEditItem(null);
    await reload();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Удалить запись ремонта?")) return;
    await repairBusService.remove(id);
    await reload();
  };

  async function saveGroupChanges() {
    if (!editingGroup) return;
    setSavingGroup(true);
    try {
      const newNumber = Number(editAppNum) || 0;
      const newDep = editDeparture || new Date().toISOString().slice(0, 10);
      const newEntry = editEntry || newDep;
      const newRegister = editRegister.trim();

      await Promise.all(
        editingGroup.repairs.map((r) =>
          repairBusService.update(r.id, {
            busId: r.busId,
            registerNumber: newRegister, // 👈 добавили
            applicationNumber: newNumber,
            departureDate: newDep,
            entryDate: newEntry,
            laborTimeId: r.laborTimeId ?? null,
            workCount: r.workCount,
            workHour: r.workHour,
            workPrice: r.workPrice,
            sparePartId: r.sparePartId ?? null,
            sparePartCount: r.sparePartCount,
            sparePartPrice: r.sparePartPrice,
          })
        )
      );
      setEditingGroup(null);
      await reload();
    } finally {
      setSavingGroup(false);
    }
  }

  async function deleteWholeGroup() {
    if (!editingGroup) return;
    if (!confirm("Удалить весь заказ-наряд целиком?")) return;
    setSavingGroup(true);
    try {
      await Promise.all(editingGroup.repairs.map((r) => repairBusService.remove(r.id)));
      setEditingGroup(null);
      await reload();
    } finally {
      setSavingGroup(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          История ремонтов — {header.garage} / {header.gov}
        </h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Поиск по № заявки
            </span>
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

      {/* Паспорт автобуса + KPI */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-2">
          <CardTitle className="text-base font-semibold">
            Информация об автобусе
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Паспорт */}
            <div className="border rounded-md p-4 bg-slate-50 h-full">
              <div className="text-sm text-muted-foreground mb-3">
                Паспорт автобуса
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">VIN-код</div>
                  <div className="font-medium">{bus?.vinCode || "—"}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Марка</div>
                  <div className="font-medium">
                    {bus?.brand || "—"} {bus?.type ? `(${bus.type})` : ""}
                  </div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">
                    Год выпуска
                  </div>
                  <div className="font-medium">{bus?.year ?? "—"}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Тип</div>
                  <div className="font-medium">{bus?.type || "—"}</div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Гаражный №</div>
                  <div className="font-bold text-blue-600">
                    {bus?.garageNumber || header.garage}
                  </div>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Госномер</div>
                  <div className="font-bold text-green-600">
                    {bus?.govNumber || header.gov}
                  </div>
                </div>
              </div>
            </div>
            {/* Расходы */}
            <div className="border rounded-md p-4 bg-slate-50 h-full">
              <div className="text-sm text-muted-foreground mb-3">
                Расходы на обслуживание
              </div>
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
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Работы", value: totals.workTotal },
                      { name: "Запчасти", value: totals.partsTotal },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(val: number) =>
                        `${val.toLocaleString("ru-RU")} ₸`
                      }
                    />
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
          <CardTitle>Заказ-наряды ({repairsPaged.totalCount || 0})</CardTitle>
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
                const partsSum = parts.reduce(
                  (s, x) => s + safeSum(x.sparePartSum, 0),
                  0
                );
                const worksSum = works.reduce(
                  (s, x) => s + safeSum(x.workSum, 0),
                  0
                );
                const totalSum = partsSum + worksSum;
                const registerNum = group[0]?.registerNumber || "—";

                return (
                  <div key={appNum} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-b">
                      <div>
                        <div className="font-semibold">
                          Заказ-наряд № {appNum || "—"} (Реестр: {registerNum})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          выезд: {fmtDate(group[0]?.departureDate)} · въезд:{" "}
                          {fmtDate(group[0]?.entryDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold mr-2">
                          {totalSum.toLocaleString("ru-RU")} ₸
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingGroup({ appNum, repairs: group });
                            setEditAppNum(String(appNum));
                            setEditDeparture((group[0]?.departureDate || "").slice(0, 10));
                            setEditEntry((group[0]?.entryDate || "").slice(0, 10));
                            setEditRegister(registerNum);
                          }}
                        >
                          Изменить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={async () => {
                            if (!confirm("Удалить весь заказ-наряд?")) return;
                            await Promise.all(group.map((r) => repairBusService.remove(r.id)));
                            await reload();
                          }}
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>

                    {/* Запчасти */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-slate-100 text-left">
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
                              <td
                                colSpan={6}
                                className="p-2 text-center text-muted-foreground border"
                              >
                                —
                              </td>
                            </tr>
                          ) : (
                            parts.map((p) => (
                              <tr key={p.id}>
                                <td className="p-2 border">
                                  {p.sparePartArticle || "—"}
                                </td>
                                <td className="p-2 border">{p.sparePart}</td>
                                <td className="p-2 border text-right">
                                  {p.sparePartCount}
                                </td>
                                <td className="p-2 border text-right">
                                  {p.sparePartPrice}
                                </td>
                                <td className="p-2 border text-right">
                                  {p.sparePartSum}
                                </td>
                                <td className="p-2 border text-right">
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
                        {parts.length > 0 && (
                          <tfoot>
                            <tr className="bg-slate-50 font-semibold">
                              <td colSpan={5} className="p-2 border text-right">
                                Итого
                              </td>
                              <td className="p-2 border text-right">
                                {partsSum.toLocaleString("ru-RU")}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>

                    {/* Работы */}
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-slate-100 text-left">
                            <th className="p-2 border">Код</th>
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
                              <td
                                colSpan={7}
                                className="p-2 text-center text-muted-foreground border"
                              >
                                —
                              </td>
                            </tr>
                          ) : (
                            works.map((w) => (
                              <tr key={w.id}>
                                <td className="p-2 border">{w.workCode}</td>
                                <td className="p-2 border">{w.workName}</td>
                                <td className="p-2 border text-right">
                                  {w.workCount}
                                </td>
                                <td className="p-2 border text-right">
                                  {w.workHour}
                                </td>
                                <td className="p-2 border text-right">
                                  {w.workPrice}
                                </td>
                                <td className="p-2 border text-right">
                                  {w.workSum}
                                </td>
                                <td className="p-2 border text-right">
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
                        {works.length > 0 && (
                          <tfoot>
                            <tr className="bg-slate-50 font-semibold">
                              <td colSpan={6} className="p-2 border text-right">
                                Итого
                              </td>
                              <td className="p-2 border text-right">
                                {worksSum.toLocaleString("ru-RU")}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Пагинация */}
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>
              {Array.from(
                { length: Math.ceil((repairsPaged.totalCount || 0) / pageSize) },
                (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((p) =>
                      p <
                      Math.ceil((repairsPaged.totalCount || 0) / pageSize)
                        ? p + 1
                        : p
                    )
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

     {/* Диалог редактирования шапки заказ-наряда */}
     <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Изменить заказ-наряд</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">№ заявки</span>
              <Input value={editAppNum} onChange={(e) => setEditAppNum(e.target.value)} />
            </div>
            <div>
              <span className="text-sm text-muted-foreground">№ реестра</span>
              <Input value={editRegister} onChange={(e) => setEditRegister(e.target.value)} />
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Дата выезда</span>
              <Input type="date" value={editDeparture} onChange={(e) => setEditDeparture(e.target.value)} />
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Дата въезда</span>
              <Input type="date" value={editEntry} onChange={(e) => setEditEntry(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGroup(null)}>
              Отмена
            </Button>
            <Button onClick={saveGroupChanges} disabled={savingGroup}>
              {savingGroup ? "Сохранение…" : "Сохранить"}
            </Button>
            <Button variant="outline" className="text-red-600" onClick={deleteWholeGroup} disabled={savingGroup}>
              Удалить заказ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
