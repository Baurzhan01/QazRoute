"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [repairsPaged, setRepairsPaged] = useState<PagedResult<Repair> | null>(null);
  const [loading, setLoading] = useState(false);
  const [depotId, setDepotId] = useState<string | null>(null);

  // сходы и плановые
  const [exits, setExits] = useState<RouteExitRepairDto[]>([]);
  const [planned, setPlanned] = useState<(RepairRecord & { date: string })[]>([]);

  // статистика
  const [stats, setStats] = useState<any[]>([]);
  const [showStats, setShowStats] = useState(false);

  // фильтры
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [departureFrom, setDepartureFrom] = useState("");
  const [departureTo, setDepartureTo] = useState("");
  const [garageNumber, setGarageNumber] = useState("");
  const [govNumber, setGovNumber] = useState("");
  const [workName, setWorkName] = useState("");
  const [sparePartName, setSparePartName] = useState("");
  const [appNumber, setAppNumber] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // depotId
  useEffect(() => {
    const auth = localStorage.getItem("authData");
    if (auth) {
      const u = JSON.parse(auth);
      setDepotId(u?.depotId || u?.busDepotId || null);
    }
  }, []);

  // загрузка фильтров из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved) {
      const f = JSON.parse(saved);
      setDepartureFrom(f.departureFrom || "");
      setDepartureTo(f.departureTo || "");
      setGarageNumber(f.garageNumber || "");
      setGovNumber(f.govNumber || "");
      setWorkName(f.workName || "");
      setSparePartName(f.sparePartName || "");
      setAppNumber(f.appNumber || "");
      setPage(f.page || 1);
      return;
    }
    // автоподстановка текущего месяца, если фильтров нет
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    setDepartureFrom(start);
    setDepartureTo(end);
  }, []);

  // сохраняем фильтры в localStorage
  useEffect(() => {
    const f = {
      page,
      departureFrom,
      departureTo,
      garageNumber,
      govNumber,
      workName,
      sparePartName,
      appNumber,
    };
    localStorage.setItem(FILTER_KEY, JSON.stringify(f));
  }, [page, departureFrom, departureTo, garageNumber, govNumber, workName, sparePartName, appNumber]);

  // подгрузка данных
  useEffect(() => {
    if (!depotId || !departureFrom || !departureTo) return;

    const params: Record<string, string | number> = {
      page,
      pageSize,
      DepartureFrom: departureFrom,
      DepartureTo: departureTo,
    };
    if (garageNumber) params.garageNumber = garageNumber;
    if (govNumber) params.govNumber = govNumber;
    if (workName) params.workName = workName;
    if (sparePartName) params.sparePartName = sparePartName;
    if (appNumber) params.appNumber = appNumber;

    // обновляем URL
    const qs = new URLSearchParams(params as any).toString();
    router.replace(`?${qs}`);

    (async () => {
      try {
        setLoading(true);

        const main = await repairBusService.getByDepotId(depotId, params);

        // сходы и плановые
        const exitArr: RouteExitRepairDto[] = [];
        const plannedArr: (RepairRecord & { date: string })[] = [];

        const start = new Date(departureFrom + "T00:00:00");
        const end = new Date(departureTo + "T23:59:59");

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10);

          const [exitRes, planRes] = await Promise.all([
            routeExitRepairService.getByDate(dateStr, depotId),
            repairService.getRepairsByDepotAndDate(dateStr, depotId),
          ]);

          if (exitRes.isSuccess && exitRes.value) {
            exitArr.push(...exitRes.value);
          }
          if (planRes.isSuccess && planRes.value) {
            plannedArr.push(...planRes.value.map((p) => ({ ...p, date: dateStr })));
          }
        }

        const stat = await statisticService.getDispatchRepairStats(
          depotId,
          departureFrom,
          departureTo
        );

        setRepairsPaged(main.value);
        setExits(exitArr);
        setPlanned(plannedArr);
        setStats(stat ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId, page, pageSize, departureFrom, departureTo, garageNumber, govNumber, workName, sparePartName, appNumber, router]);

  // KPI
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

  // фильтрация статистики по диапазону
  const filteredStats = useMemo(() => {
    if (!stats) return [];
    const start = new Date(departureFrom + "T00:00:00");
    const end = new Date(departureTo + "T23:59:59");
    return stats.filter((s) => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });
  }, [stats, departureFrom, departureTo]);

  // группировка заявок по applicationNumber и фильтрация по дате
  const grouped = useMemo(() => {
    const start = new Date(departureFrom + "T00:00:00");
    const end = new Date(departureTo + "T23:59:59");
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
  }, [repairsPaged, departureFrom, departureTo]);

  // проверка совпадений
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
        {/* Общая сумма */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-emerald-600" />
              Общая сумма
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {departureFrom} — {departureTo}
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

        {/* Работы */}
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

        {/* Запчасти */}
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
                      <Cell fill="#10b981" /> {/* Работы */}
                      <Cell fill="#6366f1" /> {/* Запчасти */}
                    </Pie>
                    <Tooltip
                      formatter={(val: number, name: string) =>
                        `${name}: ${val.toLocaleString("ru-RU")} ₸`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* подписи под графиком */}
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
      {/* Карточка событий */}
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
              <LineChart data={filteredStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), "dd.MM")}
                />
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

          {/* пагинация */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
              </PaginationItem>
              {Array.from(
                { length: Math.ceil((repairsPaged?.totalCount || 0) / pageSize) },
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
                      p < Math.ceil((repairsPaged?.totalCount || 0) / pageSize)
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
                value={departureFrom}
                onChange={(e) => setDepartureFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>Дата выезда по</Label>
              <Input
                type="date"
                value={departureTo}
                onChange={(e) => setDepartureTo(e.target.value)}
              />
            </div>
            <div>
              <Label>№ заявки</Label>
              <Input
                value={appNumber}
                onChange={(e) => setAppNumber(e.target.value)}
              />
            </div>
            <div>
              <Label>Гаражный номер</Label>
              <Input
                value={garageNumber}
                onChange={(e) => setGarageNumber(e.target.value)}
              />
            </div>
            <div>
              <Label>Госномер</Label>
              <Input
                value={govNumber}
                onChange={(e) => setGovNumber(e.target.value)}
              />
            </div>
            <div>
              <Label>Работа</Label>
              <Input
                value={workName}
                onChange={(e) => setWorkName(e.target.value)}
              />
            </div>
            <div>
              <Label>Запчасть</Label>
              <Input
                value={sparePartName}
                onChange={(e) => setSparePartName(e.target.value)}
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
                  setDepartureFrom(start);
                  setDepartureTo(end);
                  setAppNumber("");
                  setGarageNumber("");
                  setGovNumber("");
                  setWorkName("");
                  setSparePartName("");
                  setPage(1);
                  router.replace(
                    `?page=1&pageSize=${pageSize}&departureFrom=${start}&departureTo=${end}`
                  );
                }}
              >
                Сбросить все фильтры
              </Button>
              <Button onClick={() => setFilterOpen(false)}>Применить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
