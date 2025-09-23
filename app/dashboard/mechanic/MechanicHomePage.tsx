"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Wrench, BarChart3, Filter, Activity } from "lucide-react";
import { repairBusService } from "@/service/repairBusService";
import { routeExitRepairService } from "@/service/routeExitRepairService";
import { repairService } from "@/service/repairService";
import { statisticService } from "@/service/statisticService";
import type { Repair, PagedResult } from "@/types/repairBus.types";
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types";
import type { RepairRecord } from "@/types/repair.types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

function fmtDate(s?: string) {
  if (!s || s === "0001-01-01") return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ru-RU");
}

const FILTER_KEY = "mechanic_filters";

export default function MechanicHomePage() {
  const router = useRouter();

  // --- состояния ---
  const [repairsPaged, setRepairsPaged] = useState<PagedResult<Repair> | null>(null);
  const [loading, setLoading] = useState(false);
  const [depotId, setDepotId] = useState<string | null>(null);

  const [exits, setExits] = useState<RouteExitRepairDto[]>([]);
  const [planned, setPlanned] = useState<(RepairRecord & { date: string })[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [showStats, setShowStats] = useState(false);

  // --- фильтры ---
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 25,
    departureFrom: "",
    departureTo: "",
    garageNumber: "",
    govNumber: "",
    workName: "",
    sparePartName: "",
    appNumber: "",
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [filterOpen, setFilterOpen] = useState(false);

  // --- depotId ---
  useEffect(() => {
    const auth = localStorage.getItem("authData");
    if (auth) {
      const u = JSON.parse(auth);
      setDepotId(u?.depotId || u?.busDepotId || null);
    }
  }, []);

  // --- загрузка сохранённых фильтров ---
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setFilters(parsed);
      setDraftFilters(parsed);
      return;
    }
    // автоподстановка текущего месяца
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    const initial = { ...filters, departureFrom: start, departureTo: end };
    setFilters(initial);
    setDraftFilters(initial);
  }, []);

  // --- сохраняем фильтры в localStorage ---
  useEffect(() => {
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }, [filters]);

  // --- загрузка данных ---
  const reload = useCallback(async () => {
    if (!depotId || !filters.departureFrom || !filters.departureTo) return;

    setLoading(true);

    const params: Record<string, string | number> = {
      page: filters.page,
      pageSize: filters.pageSize,
      DepartureFrom: filters.departureFrom,
      DepartureTo: filters.departureTo,
    };
    if (filters.garageNumber) params.garageNumber = filters.garageNumber;
    if (filters.govNumber) params.govNumber = filters.govNumber;
    if (filters.workName) params.workName = filters.workName;
    if (filters.sparePartName) params.sparePartName = filters.sparePartName;
    if (filters.appNumber) params.appNumber = filters.appNumber;

    // обновляем URL
    const qs = new URLSearchParams(params as any).toString();
    router.replace(`?${qs}`);

    try {
      const [main, exitRes, planRes, stat] = await Promise.all([
        repairBusService.getByDepotId(depotId, params),
        routeExitRepairService.filter({
          startDate: filters.departureFrom,
          endDate: filters.departureTo,
          depotId,
          repairTypes: "all",
        }),
        repairService.filter({
          StartDate: filters.departureFrom,
          EndDate: filters.departureTo,
          Page: 1,
          PageSize: 1000,
          BusGovNumber: filters.govNumber || undefined,
          BusGarageNumber: filters.garageNumber || undefined,
        }),
        statisticService.getDispatchRepairStats(
          depotId,
          filters.departureFrom,
          filters.departureTo
        ),
      ]);

      setRepairsPaged(main.value);

      if (exitRes.isSuccess && exitRes.value) {
        setExits(exitRes.value.filter((e) => e.repairType === "Unscheduled"));
      }

      if (planRes.isSuccess && planRes.value) {
        setPlanned(
          planRes.value.map((p) => ({
            ...p,
            date: (p.departureDate || p.date || "").slice(0, 10),
          }))
        );
      }

      setStats(stat ?? []);
    } finally {
      setLoading(false);
    }
  }, [depotId, filters, router]);

  useEffect(() => {
    reload();
  }, [reload]);

  // --- KPI ---
  const kpi = useMemo(() => {
    const totalAll = repairsPaged?.totalAllSum ?? 0;
    const totalWork = repairsPaged?.totalWorkSum ?? 0;
    const totalSpare = repairsPaged?.totalSpareSum ?? 0;

    const chartData = [
      { name: "Работы", value: totalWork },
      { name: "Запчасти", value: totalSpare },
    ];

    return { totalAll, totalWork, totalSpare, chartData };
  }, [repairsPaged]);

  // --- группировка заявок ---
  const grouped = useMemo(() => {
    const start = new Date(filters.departureFrom + "T00:00:00");
    const end = new Date(filters.departureTo + "T23:59:59");
    const map = new Map<number, Repair[]>();

    for (const r of repairsPaged?.items || []) {
      const dep = new Date(r.departureDate ?? "");
      if (!isNaN(dep.getTime()) && dep >= start && dep <= end) {
        const key = r.applicationNumber ?? 0;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [repairsPaged, filters.departureFrom, filters.departureTo]);

  // --- источник (сход/плановый) ---
  function getSource(r: Repair): { label: string; match: boolean } {
    const depDate = r.departureDate?.slice(0, 10);
    if (!depDate) return { label: "—", match: false };

    const matchExit = exits.find(
      (e) => e.bus?.id === r.busId && e.startDate?.slice(0, 10) === depDate
    );
    if (matchExit) {
      return {
        label: matchExit.route?.number
          ? `Сход (маршрут ${matchExit.route.number})`
          : "Сход (резерв)",
        match: true,
      };
    }

    const matchPlan = planned.find(
      (p) => p.bus?.id === r.busId && p.date?.slice(0, 10) === depDate
    );
    if (matchPlan) {
      return { label: "Плановый ремонт", match: true };
    }

    return { label: "—", match: false };
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Механик — главная</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Фильтрация
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/mechanic/repairs">
              <ClipboardList className="mr-2 h-4 w-4" /> Реестр ремонтов
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-emerald-600" />
              Общая сумма
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {filters.departureFrom} — {filters.departureTo}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "…" : `${kpi.totalAll.toLocaleString("ru-RU")} ₸`}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Заявок: {repairsPaged?.totalCount ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Работы
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? "…" : `${kpi.totalWork.toLocaleString("ru-RU")} ₸`}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Запчасти
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {loading ? (
              "…"
            ) : (
              <>
                <ResponsiveContainer width={220} height={160}>
                  <PieChart>
                    <Pie
                      data={kpi.chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={70}
                      labelLine={false}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#6366f1" />
                    </Pie>
                    <Tooltip
                      formatter={(val: number, name: string) =>
                        `${name}: ${val.toLocaleString("ru-RU")} ₸`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    Работы: {kpi.totalWork.toLocaleString("ru-RU")} ₸
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                    Запчасти: {kpi.totalSpare.toLocaleString("ru-RU")} ₸
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* События */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" /> События (сходы/плановые)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowStats((s) => !s)}>
            {showStats ? "Скрыть график" : "Показать график"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-sm mb-4">
            Сходов: {exits.length} · Плановых: {planned.length}
          </div>
          {showStats && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), "dd.MM")} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="plannedRepairCount"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Плановые ремонты"
                />
                <Line
                  type="monotone"
                  dataKey="unplannedRepairCount"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Сходы с линии"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Таблица заявок */}
      <Card>
        <CardHeader>
          <CardTitle>Заявки ({grouped.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : grouped.length === 0 ? (
            <div className="text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">№ заявки</th>
                    <th className="py-2 pr-4">Автобус</th>
                    <th className="py-2 pr-4">Первая запись</th>
                    <th className="py-2 pr-4">Сумма</th>
                    <th className="py-2 pr-4">Заезд</th>
                    <th className="py-2 pr-4">Источник</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map(([appNum, group]) => {
                    const totalSum = group.reduce((s, x) => s + (x.allSum ?? 0), 0);
                    const first = group[0];
                    const source = getSource(first);

                    return (
                      <tr
                        key={appNum}
                        className={`border-t ${source.match ? "bg-green-50" : "bg-red-50"}`}
                      >
                        <td className="py-2 pr-4">
                          <Link
                            className="text-sky-600 hover:underline"
                            href={`/dashboard/mechanic/repairs/bus/${first.busId}?appNum=${appNum}`}
                          >
                            {appNum}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          {first.garageNumber || "—"} / {first.govNumber || "—"}
                        </td>
                        <td className="py-2 pr-4">
                          {first.workName || first.sparePart || "—"}
                        </td>
                        <td className="py-2 pr-4">
                          {totalSum.toLocaleString("ru-RU")} ₸
                        </td>
                        <td className="py-2">{fmtDate(first.departureDate)}</td>
                        <td className="py-2">{source.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))} />
              </PaginationItem>
              {Array.from(
                { length: Math.ceil((repairsPaged?.totalCount || 0) / filters.pageSize) },
                (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={filters.page === i + 1}
                      onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      page:
                        f.page < Math.ceil((repairsPaged?.totalCount || 0) / filters.pageSize)
                          ? f.page + 1
                          : f.page,
                    }))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      {/* Фильтрация */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Фильтрация</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Дата выезда с</Label>
              <Input
                type="date"
                value={draftFilters.departureFrom}
                onChange={(e) =>
                  setDraftFilters((f) => ({ ...f, departureFrom: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Дата выезда по</Label>
              <Input
                type="date"
                value={draftFilters.departureTo}
                onChange={(e) =>
                  setDraftFilters((f) => ({ ...f, departureTo: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>№ заявки</Label>
              <Input
                value={draftFilters.appNumber}
                onChange={(e) =>
                  setDraftFilters((f) => ({ ...f, appNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Гаражный номер</Label>
              <Input
                value={draftFilters.garageNumber}
                onChange={(e) =>
                  setDraftFilters((f) => ({ ...f, garageNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Госномер</Label>
              <Input
                value={draftFilters.govNumber}
                onChange={(e) =>
                  setDraftFilters((f) => ({ ...f, govNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Работа</Label>
              <Input
                value={draftFilters.workName}
                onChange={(e) =>
                  setDraftFilters((f) => ({ ...f, workName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Запчасть</Label>
              <Input
                value={draftFilters.sparePartName}
                onChange={(e) =>
                  setDraftFilters((f) => ({ ...f, sparePartName: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem(FILTER_KEY);
                  const now = new Date();
                  const start = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString()
                    .slice(0, 10);
                  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    .toISOString()
                    .slice(0, 10);
                  const reset = {
                    ...filters,
                    page: 1,
                    departureFrom: start,
                    departureTo: end,
                    garageNumber: "",
                    govNumber: "",
                    workName: "",
                    sparePartName: "",
                    appNumber: "",
                  };
                  setFilters(reset);
                  setDraftFilters(reset);
                  setFilterOpen(false);
                }}
              >
                Сбросить все фильтры
              </Button>
              <Button
                onClick={() => {
                  setFilters(draftFilters);
                  setFilterOpen(false);
                }}
              >
                Применить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
