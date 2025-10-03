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

function fmtDate(s?: string) {
  if (!s || s === "0001-01-01") return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ru-RU");
}

export default function RegisterDetailPage() {
  const params = useParams();
  const router = useRouter();

  const registerNumber = params.registerNumber as string;

  const [exits, setExits] = useState<RouteExitRepairDto[]>([]);
  const [planned, setPlanned] = useState<(RepairRecord & { date: string })[]>([]);

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
        page,
        pageSize,
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
  }, [registerNumber, page, pageSize, filters]);

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
  
      const startDate = applications[0]?.firstDepartureDate;
      const endDate = applications[0]?.lastEntryDate;
      const depotId = localStorage.getItem("busDepotId"); // 👈 правильный ключ
  
      if (!startDate || !endDate || !depotId) return;
  
      const [exitRes, planRes] = await Promise.all([
        routeExitRepairService.filter({
          startDate,
          endDate,
          depotId, // теперь корректно
          repairTypes: "all",
        }),
        repairService.filter({
          StartDate: startDate,
          EndDate: endDate,
          Page: 1,
          PageSize: 1000,
        }),
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
    };
  
    fetchSources();
  }, [applications]);  

  // источник строки
  function getSource(a: RepairRegisterApplication) {
    const depDate = a.firstDepartureDate?.slice(0, 10);
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

    const matchPlan = planned.find(
      (p) => p.bus?.id === a.busId && p.date?.slice(0, 10) === depDate
    );
    if (matchPlan) return { label: "Плановый ремонт", match: true };

    return { label: "—", match: false };
  }

  const totalPages = Math.max(1, Math.ceil(applications.length / pageSize));
  const safePage = Math.min(page, totalPages);

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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={safePage === p}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

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
