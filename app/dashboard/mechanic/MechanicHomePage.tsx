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

type Filters = {
  page: number;
  pageSize: number;
  departureFrom: string;
  departureTo: string;
  garageNumber: string;
  govNumber: string;
  workName: string;
  sparePartName: string;
  appNumber: string;
};

export default function MechanicHomePage() {
  const router = useRouter();

  const [repairsPaged, setRepairsPaged] = useState<PagedResult<Repair> | null>(null);
  const [loading, setLoading] = useState(false);
  const [depotId, setDepotId] = useState<string | null>(null);

  // Полный набор записей и KPI по всем записям
  const [allRepairs, setAllRepairs] = useState<Repair[]>([]);
  const [kpiTotals, setKpiTotals] = useState({ totalAll: 0, totalWork: 0, totalSpare: 0 });

  const [exits, setExits] = useState<RouteExitRepairDto[]>([]);
  const [planned, setPlanned] = useState<(RepairRecord & { date: string })[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [showStats, setShowStats] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 10,
    departureFrom: "",
    departureTo: "",
    garageNumber: "",
    govNumber: "",
    workName: "",
    sparePartName: "",
    appNumber: "",
  });
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);
  const [filterOpen, setFilterOpen] = useState(false);

  // depotId
  useEffect(() => {
    const auth = localStorage.getItem("authData");
    if (auth) {
      const u = JSON.parse(auth);
      setDepotId(u?.depotId || u?.busDepotId || null);
    }
  }, []);

  // загрузка фильтров / инициализация месяца
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved) {
      const parsed: Filters = JSON.parse(saved);
      // Жёстко фиксируем размер страницы = 10, даже если сохранён другой
      const fixed = { ...parsed, pageSize: 10 } as Filters;
      setFilters(fixed);
      setDraftFilters(fixed);
      return;
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const initial: Filters = {
      page: 1,
      pageSize: 10,
      departureFrom: start,
      departureTo: end,
      garageNumber: "",
      govNumber: "",
      workName: "",
      sparePartName: "",
      appNumber: "",
    };
    setFilters(initial);
    setDraftFilters(initial);
  }, []);

  // сохраняем активные фильтры
  useEffect(() => {
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }, [filters]);

  // загрузка данных
  const reload = useCallback(async () => {
    if (!depotId || !filters.departureFrom || !filters.departureTo) return;

    setLoading(true);
    const applicationNumberFilter = filters.appNumber.trim();
    // Сохраняем параметры в URL (текущая страница в UI и pageSize групп)
    const urlParams: Record<string, string | number> = {
      page: filters.page,
      pageSize: filters.pageSize,
      DepartureFrom: filters.departureFrom,
      DepartureTo: filters.departureTo,
    };
    if (filters.garageNumber) urlParams.garageNumber = filters.garageNumber;
    if (filters.govNumber) urlParams.govNumber = filters.govNumber;
    if (filters.workName) urlParams.workName = filters.workName;
    if (filters.sparePartName) urlParams.sparePartName = filters.sparePartName;
    if (applicationNumberFilter) urlParams.AppNumber = applicationNumberFilter;
    const qs = new URLSearchParams(urlParams as any).toString();
    router.replace(`?${qs}`);

    try {
      // Выгружаем ВСЕ страницы по выбранному периоду
      const pageSizeForFetch = 1000; // максимально крупные страницы для снижения числа запросов
      let page = 1;
      let totalCount = 0;
      let accumulated: Repair[] = [];

      // Первый запрос — чтобы узнать totalCount
      const baseParams: Record<string, string | number> = {
        page,
      pageSize: pageSizeForFetch,
      DepartureFrom: filters.departureFrom,
      DepartureTo: filters.departureTo,
    };
    if (filters.garageNumber) baseParams.garageNumber = filters.garageNumber;
    if (filters.govNumber) baseParams.govNumber = filters.govNumber;
    if (filters.workName) baseParams.workName = filters.workName;
    if (filters.sparePartName) baseParams.sparePartName = filters.sparePartName;
    if (applicationNumberFilter) baseParams.AppNumber = applicationNumberFilter;

      const first = await repairBusService.getByDepotId(depotId, baseParams);
      const firstValue: PagedResult<Repair> =
        first.value || ({ page: 1, pageSize: pageSizeForFetch, totalCount: 0, items: [] } as PagedResult<Repair>);
      totalCount = firstValue.totalCount || 0;
      accumulated = firstValue.items || [];

      // Догружаем оставшиеся страницы, если есть
      const totalPagesFetch = Math.max(1, Math.ceil(totalCount / pageSizeForFetch));
      if (totalPagesFetch > 1) {
        const promises: Promise<any>[] = [];
        for (let p = 2; p <= totalPagesFetch; p++) {
          promises.push(
            repairBusService.getByDepotId(depotId, {
              ...baseParams,
              page: p,
              pageSize: pageSizeForFetch,
            })
          );
        }
        const rest = await Promise.all(promises);
        for (const r of rest) {
          accumulated = accumulated.concat(r.value?.items || []);
        }
      }

      // KPI по всем записям
      const totals = accumulated.reduce(
        (acc, x) => {
          const work = x.workSum ?? 0;
          const spare = x.sparePartSum ?? 0;
          const all = x.allSum ?? work + spare;
          acc.totalWork += work;
          acc.totalSpare += spare;
          acc.totalAll += all;
          return acc;
        },
        { totalAll: 0, totalWork: 0, totalSpare: 0 }
      );

      setAllRepairs(accumulated);
      setKpiTotals(totals);
      setRepairsPaged(firstValue); // сохраняем последний ответ для совместимости, но UI опирается на allRepairs/kpiTotals

      // Прочие источники/статистика
      const [exitRes, planRes, stat] = await Promise.all([
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

      setExits(exitRes.isSuccess && exitRes.value ? exitRes.value.filter((e) => e.repairType === "Unscheduled") : []);
      setPlanned(
        planRes.isSuccess && planRes.value
          ? planRes.value.map((p) => ({
              ...p,
              date: (p.departureDate || p.date || "").slice(0, 10),
            }))
          : []
      );
      setStats(stat ?? []);
    } finally {
      setLoading(false);
    }
  }, [
    depotId,
    filters.departureFrom,
    filters.departureTo,
    filters.garageNumber,
    filters.govNumber,
    filters.workName,
    filters.sparePartName,
    filters.appNumber,
    router,
  ]);

  useEffect(() => {
    reload();
  }, [reload]);

  // KPI
  const kpi = useMemo(() => {
    const totalAll = kpiTotals.totalAll;
    const totalWork = kpiTotals.totalWork;
    const totalSpare = kpiTotals.totalSpare;
    return {
      totalAll,
      totalWork,
      totalSpare,
      chartData: [
        { name: "Работы", value: totalWork },
        { name: "Запчасти", value: totalSpare },
      ],
    };
  }, [kpiTotals]);
  

  

  // группировка заявок: по номеру заявки + автобусу (чтобы не смешивать разные автобусы с одинаковым номером)
  const grouped = useMemo(() => {
    const start = new Date(filters.departureFrom + "T00:00:00");
    const end = new Date(filters.departureTo + "T23:59:59");
    const map = new Map<string, Repair[]>();
    for (const r of allRepairs || []) {
      const dep = new Date(r.departureDate ?? "");
      if (!isNaN(dep.getTime()) && dep >= start && dep <= end) {
        const key = `${r.applicationNumber ?? 0}_${r.busId}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
      }
    }
    // сортируем по номеру заявки (desc), затем по дате (desc)
    return Array.from(map.entries()).sort((a, b) => {
      const aFirst = a[1][0];
      const bFirst = b[1][0];
      const aNum = aFirst?.applicationNumber ?? 0;
      const bNum = bFirst?.applicationNumber ?? 0;
      if (bNum !== aNum) return bNum - aNum;
      const aDate = new Date(aFirst?.departureDate ?? 0).getTime();
      const bDate = new Date(bFirst?.departureDate ?? 0).getTime();
      return bDate - aDate;
    });
  }, [allRepairs, filters.departureFrom, filters.departureTo]);

  // серверная пагинация
  const totalGroups = grouped.length;
  const totalPages = Math.max(1, Math.ceil(totalGroups / (filters.pageSize || 10)));
  const safePage = Math.min(filters.page || 1, totalPages);

  useEffect(() => {
    if (repairsPaged && filters.page > totalPages) {
      setFilters((f) => ({ ...f, page: totalPages }));
    }
  }, [repairsPaged, totalPages, filters.page]);

  // Пагинация по группам (без пустых строк)
  const pagedGrouped = useMemo(
    () =>
      grouped.slice(
        (safePage - 1) * (filters.pageSize || 10),
        safePage * (filters.pageSize || 10)
      ),
    [grouped, safePage, filters.pageSize]
  );
  

  // источник
  function getSource(r: Repair) {
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
    if (matchPlan) return { label: "Плановый ремонт", match: true };
    return { label: "—", match: false };
  }

  function getPageNumbers(current: number, total: number, maxVisible = 10) {
    const pages: (number | string)[] = []
  
    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      const left = Math.max(2, current - 2)
      const right = Math.min(total - 1, current + 2)
  
      pages.push(1)
      if (left > 2) pages.push("...")
  
      for (let i = left; i <= right; i++) pages.push(i)
  
      if (right < total - 1) pages.push("...")
      pages.push(total)
    }
  
    return pages
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
            <Link href="/dashboard/mechanic/repair-registers">
              <ClipboardList className="mr-2 h-4 w-4" /> Реестр ремонтов
            </Link>
          </Button>

          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            asChild
          >
            <Link href="/dashboard/mechanic/minor-repair/new">
              ⚡ Мелко-срочный ремонт (batch)
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              Заявок: {totalGroups}
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
          <CardContent className="text-3xl font-bold">
            {loading ? "…" : `${kpi.totalSpare.toLocaleString("ru-RU")} ₸`}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Структура затрат
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {loading ? (
              "…"
            ) : (
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
            )}
            {!loading && (
              <div className="mt-3 text-sm text-muted-foreground">
                Работы: {kpi.totalWork.toLocaleString("ru-RU")} ₸ · Запчасти: {kpi.totalSpare.toLocaleString("ru-RU")} ₸
              </div>
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
                <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), "dd.MM")} />
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
          <CardTitle>Заявки ({totalGroups})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : pagedGrouped.length === 0 ? (
            <div className="text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">№ заявки</th>
                    <th className="py-2 pr-4">Автобус</th>
                    <th className="py-2 pr-4">Первая запись</th>
                    <th className="py-2 pr-4">Сумма</th>
                    <th className="py-2 pr-4">Въезд</th>
                    <th className="py-2 pr-4">Выезд</th>
                    <th className="py-2 pr-4">Источник</th>
                  </tr>
                </thead>
                <tbody>
                {pagedGrouped.map(([compositeKey, group], idx) => {
                  const appNum = group[0]?.applicationNumber ?? 0;
                  const totalSum = group.reduce((s: number, x: Repair) => s + (x.workSum ?? 0) + (x.sparePartSum ?? 0), 0);
                  const first = group[0];
                  const source = getSource(first);

                  return (
                    <tr
                      key={compositeKey}
                      className={`border-t ${source.match ? "bg-green-50" : "bg-red-50"}`}
                    >
                      <td className="py-2 pr-4 text-muted-foreground">
                        {(safePage - 1) * filters.pageSize + idx + 1}
                      </td>
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
                      <td className="py-2">{fmtDate(first.entryDate)}</td>
                      <td className="py-2">{fmtDate(first.departureDate)}</td>
                      <td className="py-2">{source.label}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}

       {/* Пагинация */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
                  }
                >
                  Предыдущая
                </PaginationPrevious>
              </PaginationItem>

              {getPageNumbers(safePage, totalPages).map((p, i) =>
                typeof p === "number" ? (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={safePage === p}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={i}>
                    <span className="px-2">…</span>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      page: f.page < totalPages ? f.page + 1 : f.page,
                    }))
                  }
                >
                  Следующая
                </PaginationNext>
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

            {/* Размер страницы зафиксирован: 10 заявок на страницу */}

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
                  const reset: Filters = {
                    page: 1,
                    pageSize: 10,
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
                  setFilters((prev) => ({
                    ...prev,
                    ...draftFilters,
                    pageSize: 10, // фиксированный размер страницы
                    page: 1,
                  }));
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
