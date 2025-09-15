"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Wrench, BarChart3, Filter } from "lucide-react";
import { repairBusService } from "@/service/repairBusService";
import type { Repair, PagedResult } from "@/types/repairBus.types";
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
} from "recharts";

export default function MechanicHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [repairsPaged, setRepairsPaged] = useState<PagedResult<Repair> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [depotId, setDepotId] = useState<string | null>(null);

  // фильтры
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize] = useState(25);
  const [departureFrom, setDepartureFrom] = useState(
    searchParams.get("departureFrom") || ""
  );
  const [departureTo, setDepartureTo] = useState(
    searchParams.get("departureTo") || ""
  );
  const [garageNumber, setGarageNumber] = useState(
    searchParams.get("garageNumber") || ""
  );
  const [govNumber, setGovNumber] = useState(
    searchParams.get("govNumber") || ""
  );
  const [workName, setWorkName] = useState(searchParams.get("workName") || "");
  const [sparePartName, setSparePartName] = useState(
    searchParams.get("sparePartName") || ""
  );
  const [appNumber, setAppNumber] = useState(
    searchParams.get("appNumber") || ""
  );

  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("authData");
    if (auth) {
      const u = JSON.parse(auth);
      setDepotId(u?.depotId || u?.busDepotId || null);
    }
  }, []);

  // по умолчанию текущий месяц
  useEffect(() => {
    if (departureFrom && departureTo) return;
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

  // подгрузка данных
  useEffect(() => {
    if (!depotId || !departureFrom || !departureTo) return;

    const params: Record<string, string | number> = {
      page,
      pageSize,
      DepartureFrom: departureFrom, // 👈 правильные параметры
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
        const res = await repairBusService.getByDepotId(depotId, params);
        setRepairsPaged(res.value);
      } finally {
        setLoading(false);
      }
    })();
  }, [
    depotId,
    page,
    pageSize,
    departureFrom,
    departureTo,
    garageNumber,
    govNumber,
    workName,
    sparePartName,
    appNumber,
    router,
  ]);

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
              {departureFrom} — {departureTo}
            </div>
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

                <div className="flex justify-center gap-6 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>{" "}
                    Работы: {kpi.totalWork.toLocaleString("ru-RU")} ₸
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span>{" "}
                    Запчасти: {kpi.totalSpare.toLocaleString("ru-RU")} ₸
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Таблица */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Ремонты ({repairsPaged?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : repairsPaged?.items?.length === 0 ? (
            <div className="text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">№ заявки</th>
                    <th className="py-2 pr-4">Автобус</th>
                    <th className="py-2 pr-4">Работа / Запчасть</th>
                    <th className="py-2 pr-4">Сумма</th>
                    <th className="py-2">Заезд</th>
                  </tr>
                </thead>
                <tbody>
                  {repairsPaged?.items.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-4">
                        <Link
                          className="text-sky-600 hover:underline"
                          href={`/dashboard/mechanic/repairs/${r.id}`}
                        >
                          {r.applicationNumber || "—"}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">
                        {r.garageNumber || "—"} / {r.govNumber || "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {r.workName || r.sparePart || "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {(r.allSum ?? 0).toLocaleString("ru-RU")} ₸
                      </td>
                      <td className="py-2">
                        {r.departureDate
                          ? new Date(r.departureDate).toLocaleDateString("ru-RU")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* пагинация */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
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
                placeholder="Напр. 5123"
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

            {/* Кнопки действий */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString()
                    .slice(0, 10);
                  const end = new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0
                  )
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
                Очистить
              </Button>
              <Button onClick={() => setFilterOpen(false)}>Применить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
