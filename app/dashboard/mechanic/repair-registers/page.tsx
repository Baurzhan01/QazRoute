"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, ArrowLeft, BarChart3 } from "lucide-react";
import { repairBusService } from "@/service/repairBusService";
import type { PagedResult } from "@/types/repairBus.types";
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

function fmtDate(s?: string) {
  if (!s || s === "0001-01-01") return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ru-RU");
}

// Тип под реестр (агрегированные данные)
interface RepairRegister {
  registerNumber: string;
  applicationsCount: number;
  totalWorkSum: number;
  totalSpareSum: number;
  totalAllSum: number;
  firstInputDate: string;
  lastInputDate: string;
}

export default function RepairRegistersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [registers, setRegisters] = useState<RepairRegister[]>([]);
  const [paged, setPaged] = useState<
    (PagedResult<RepairRegister> & {
      grandTotalWorkSum?: number;
      grandTotalSpareSum?: number;
      grandTotalAllSum?: number;
    }) | null
  >(null);

  const loadRegisters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await repairBusService.getRegisters({
        page,
        pageSize,
      });
      if (res.isSuccess && res.value) {
        setPaged(res.value);
        setRegisters(res.value.items || []);
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadRegisters();
  }, [loadRegisters]);

  // KPI теперь считаем из grandTotal*
  const kpi = useMemo(() => {
    return {
      totalWork: paged?.grandTotalWorkSum ?? 0,
      totalSpare: paged?.grandTotalSpareSum ?? 0,
      totalAll: paged?.grandTotalAllSum ?? 0,
      chartData: [
        { name: "Работы", value: paged?.grandTotalWorkSum ?? 0 },
        { name: "Запчасти", value: paged?.grandTotalSpareSum ?? 0 },
      ],
    };
  }, [paged]);

  const totalPages = paged ? Math.max(1, Math.ceil(paged.totalCount / pageSize)) : 1;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Реестры ремонтов</h1>
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
            {loading ? "…" : `${kpi.totalAll.toLocaleString("ru-RU")} ₸`}
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
          <CardContent className="flex justify-center">
            {loading ? (
              "…"
            ) : (
              <ResponsiveContainer width={200} height={160}>
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
          </CardContent>
        </Card>
      </div>

      {/* Таблица */}
      <Card>
        <CardHeader>
          <CardTitle>Список реестров ({paged?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : registers.length === 0 ? (
            <div className="text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">№ реестра</th>
                    <th className="py-2 pr-4">Кол-во заявок</th>
                    <th className="py-2 pr-4">Сумма</th>
                    <th className="py-2 pr-4">Первая дата</th>
                    <th className="py-2 pr-4">Последняя дата</th>
                  </tr>
                </thead>
                <tbody>
                  {registers.map((r, idx) => (
                    <tr key={r.registerNumber} className="border-t">
                      <td className="py-2 pr-4 text-muted-foreground">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-2 pr-4">
                        <Link
                          className="text-sky-600 hover:underline"
                          href={`/dashboard/mechanic/repair-registers/${r.registerNumber}`}
                        >
                          {r.registerNumber}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{r.applicationsCount}</td>
                      <td className="py-2 pr-4">
                        {(r.totalAllSum ?? 0).toLocaleString("ru-RU")} ₸
                      </td>
                      <td className="py-2 pr-4">{fmtDate(r.firstInputDate)}</td>
                      <td className="py-2 pr-4">{fmtDate(r.lastInputDate)}</td>
                    </tr>
                  ))}
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
                    isActive={page === p}
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
    </div>
  );
}
