"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, ClipboardList, Filter } from "lucide-react";
import { repairBusService } from "@/service/repairBusService";
import { routeExitRepairService } from "@/service/routeExitRepairService";
import { repairService } from "@/service/repairService";
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types";
import type { RepairRecord } from "@/types/repair.types";
import type { RepairRegisterApplication } from "@/types/repairBus.types";
import { exportRegisterToExcel } from "./utils/exportRegisterToExcel";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PlannedRepairLookup = RepairRecord & {
  dateStart: string;
  dateEnd: string;
  busId?: string | null;
};

function fmtDate(s?: string) {
  if (!s || s === "0001-01-01") return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ru-RU");
}

function toDateOnly(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function hasDateOverlap(
  startA?: string,
  endA?: string,
  startB?: string,
  endB?: string
) {
  if (!startA || !startB) return false;
  const normalizedEndA = endA || startA;
  const normalizedEndB = endB || startB;
  return !(normalizedEndA < startB || normalizedEndB < startA);
}

function getPageNumbers(current: number, total: number, maxVisible = 9) {
  const pages: (number | string)[] = [];

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  const left = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);

  pages.push(1);
  if (left > 2) pages.push("…");

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < total - 1) pages.push("…");
  pages.push(total);

  return pages;
}

export default function RegisterDetailPage() {
  const params = useParams();
  const router = useRouter();

  const registerNumber = params.registerNumber as string;

  const [exits, setExits] = useState<RouteExitRepairDto[]>([]);
  const [planned, setPlanned] = useState<PlannedRepairLookup[]>([]);

  const FILTER_KEY = `repair_register_filters_${registerNumber}`;

  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<RepairRegisterApplication[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [kpiTotals, setKpiTotals] = useState({ totalAll: 0, totalWork: 0, totalSpare: 0 });


  const [totals, setTotals] = useState({
    totalWork: 0,
    totalSpare: 0,
    totalAll: 0,
  });

  // --- фильтры ---
  const [filters, setFilters] = useState({
    appNumber: "",
    garageNumber: "",
    govNumber: "",
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [filterOpen, setFilterOpen] = useState(false);

  // загрузка фильтров из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setFilters(parsed);
      setDraftFilters(parsed);
    }
  }, [FILTER_KEY]);

  // сохранение фильтров в localStorage
  useEffect(() => {
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }, [filters, FILTER_KEY]);

  // загрузка реестра
  const loadRegister = useCallback(async () => {
    setLoading(true);
    try {
      const res = await repairBusService.getByRegister(registerNumber, {
        appNumber: filters.appNumber || undefined,
        garageNumber: filters.garageNumber || undefined,
        govNumber: filters.govNumber || undefined,
      });
      if (res.isSuccess && res.value) {
        setApplications(res.value.applications || []);
        setTotals({
          totalWork: res.value.totalWorkSum ?? 0,
          totalSpare: res.value.totalSpareSum ?? 0,
          totalAll: res.value.totalAllSum ?? 0,
        });
        setKpiTotals({
          totalAll: res.value.totalAllSum ?? 0,
          totalWork: res.value.totalWorkSum ?? 0,
          totalSpare: res.value.totalSpareSum ?? 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [registerNumber, filters]);

  useEffect(() => {
    loadRegister();
  }, [loadRegister]);

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
  

  // загрузка источников (сходы/плановые ремонты)
  useEffect(() => {
    const fetchSources = async () => {
      if (!applications.length) return;

      const depotId = localStorage.getItem("busDepotId");
      if (!depotId) return;

      const startDate = applications.reduce<string | null>((min, application) => {
        const current = application.firstDepartureDate?.slice(0, 10);
        if (!current) return min;
        if (!min || current < min) return current;
        return min;
      }, null);

      const endDate = applications.reduce<string | null>((max, application) => {
        const current = application.lastEntryDate?.slice(0, 10);
        if (!current) return max;
        if (!max || current > max) return current;
        return max;
      }, null);

      if (!startDate || !endDate) return;

      const [exitRes, planRes] = await Promise.all([
        routeExitRepairService.filter({
          startDate,
          endDate,
          depotId,
          repairTypes: "all",
        }),
        repairService.filter({
          StartDate: startDate,
          EndDate: endDate,
          Page: 1,
          PageSize: 1000,
        }),
      ]);

      setExits(
        exitRes.isSuccess && exitRes.value
          ? exitRes.value.filter((e) => e.repairType === "Unscheduled")
          : []
      );
      const planItems =
        planRes.isSuccess && planRes.value
          ? Array.isArray(planRes.value)
            ? planRes.value
            : Array.isArray((planRes.value as any).items)
              ? ((planRes.value as any).items as RepairRecord[])
              : []
          : [];

      setPlanned(
        planItems.map((p) => {
          const rawStart = p.departureDate || p.date || "";
          const normalizedStart = rawStart ? rawStart.slice(0, 10) : "";
          const rawEnd =
            ((p as { entryDate?: string }).entryDate ||
              p.date ||
              p.departureDate ||
              "") ?? "";
          const normalizedEnd = rawEnd ? rawEnd.slice(0, 10) : normalizedStart;
          const fallbackBusId = (p as { busId?: string }).busId ?? null;

          return {
            ...p,
            busId: p.bus?.id ?? fallbackBusId,
            dateStart: normalizedStart,
            dateEnd: normalizedEnd,
          };
        })
      );
    };

    fetchSources();
  }, [applications]);

  // источник строки
  function getSource(a: RepairRegisterApplication) {
    const depDate = toDateOnly(a.firstDepartureDate);
    if (!depDate) return { label: "—", match: false };

    const matchExit = exits.find(
      (e) => e.bus?.id === a.busId && e.startDate?.slice(0, 10) === depDate
    );
    if (matchExit) {
      return {
        label: matchExit.route?.number
          ? `Сход (маршрут ${matchExit.route.number})`
          : "Сход (резерв)",
        match: true,
      };
    }

    const appEndDate = toDateOnly(a.lastEntryDate) || depDate;

    const matchPlan = planned.find((p) => {
      const planBusId = p.busId || p.bus?.id;
      if (!planBusId || planBusId !== a.busId) return false;
      return hasDateOverlap(p.dateStart, p.dateEnd, depDate, appEndDate);
    });
    if (matchPlan) {
      const descriptionLabel = matchPlan.description?.trim()
        ? `Плановый ремонт (${matchPlan.description})`
        : "Плановый ремонт";
      return { label: descriptionLabel, match: true };
    }

    return { label: "—", match: false };
  }

  const totalPages = Math.max(1, Math.ceil(applications.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedApps = useMemo(
    () =>
      applications.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
      ),
    [applications, safePage, pageSize]
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Реестр №{registerNumber}</h1>
        </div>
        <div className="flex gap-2">
        <Button
        variant="outline"
        onClick={() =>
            exportRegisterToExcel(registerNumber, applications, totals, exits, planned)
        }
        >
        Экспорт в Excel
        </Button>
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Фильтрация
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-sky-600" />
              Общая сумма
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? "…" : `${totals.totalAll.toLocaleString("ru-RU")} ₸`}
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
            {loading ? "…" : `${totals.totalWork.toLocaleString("ru-RU")} ₸`}
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
            {loading ? "…" : `${totals.totalSpare.toLocaleString("ru-RU")} ₸`}
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

      {/* Таблица заявок */}
      <Card>
        <CardHeader>
          <CardTitle>Заявки ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : pagedApps.length === 0 ? (
            <div className="text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">№ заявки</th>
                    <th className="py-2 pr-4">Автобус</th>
                    <th className="py-2 pr-4">Работы (₸)</th>
                    <th className="py-2 pr-4">Кол-во работ</th>
                    <th className="py-2 pr-4">Запчасти (₸)</th>
                    <th className="py-2 pr-4">Кол-во запчастей</th>
                    <th className="py-2 pr-4">Сумма (₸)</th>
                    <th className="py-2 pr-4">Период</th>
                    <th className="py-2 pr-4">Источник</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedApps.map((a, idx) => {
                    const source = getSource(a);
                    return (
                      <tr
                        key={a.applicationNumber}
                        className={`border-t ${source.match ? "bg-green-50" : "bg-red-50"}`}
                      >
                        <td className="py-2 pr-4 text-muted-foreground">
                          {(safePage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-2 pr-4">
                          <Link
                            className="text-sky-600 hover:underline"
                            href={`/dashboard/mechanic/repairs/bus/${a.busId}?appNum=${a.applicationNumber}`}
                          >
                            {a.applicationNumber}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          {a.garageNumber || "—"} / {a.govNumber || "—"}
                        </td>
                        <td className="py-2 pr-4">{a.workSum.toLocaleString("ru-RU")} ₸</td>
                        <td className="py-2 pr-4">{a.workCount}</td>
                        <td className="py-2 pr-4">{a.spareSum.toLocaleString("ru-RU")} ₸</td>
                        <td className="py-2 pr-4">{a.sparePartCount}</td>
                        <td className="py-2 pr-4 font-semibold">
                          {a.allSum.toLocaleString("ru-RU")} ₸
                        </td>
                        <td className="py-2 pr-4">
                          {fmtDate(a.firstDepartureDate)} — {fmtDate(a.lastEntryDate)}
                        </td>
                        <td className="py-2 pr-4">{source.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={3} className="py-2 pr-4 text-right">
                      Итого
                    </td>
                    <td className="py-2 pr-4">
                      {totals.totalWork.toLocaleString("ru-RU")} ₸
                    </td>
                    <td className="py-2 pr-4">—</td>
                    <td className="py-2 pr-4">
                      {totals.totalSpare.toLocaleString("ru-RU")} ₸
                    </td>
                    <td className="py-2 pr-4">—</td>
                    <td className="py-2 pr-4 font-semibold">
                      {totals.totalAll.toLocaleString("ru-RU")} ₸
                    </td>
                    <td className="py-2 pr-4" colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Пагинация */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Предыдущая
                </PaginationPrevious>
              </PaginationItem>

              {getPageNumbers(safePage, totalPages).map((p, index) =>
                typeof p === "number" ? (
                  <PaginationItem key={`page-${p}`}>
                    <PaginationLink
                      isActive={safePage === p}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <span className="px-2 text-muted-foreground">{p}</span>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                >
                  Следующая
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      {/* Диалог фильтрации */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Фильтрация</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const reset = { appNumber: "", garageNumber: "", govNumber: "" };
                  setFilters(reset);
                  setDraftFilters(reset);
                  setPage(1);
                  setFilterOpen(false);
                  localStorage.removeItem(FILTER_KEY);
                }}
              >
                Сбросить
              </Button>
              <Button
                onClick={() => {
                  setFilters(draftFilters);
                  setPage(1);
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
