// TimesheetPage.tsx
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useTimesheet } from "@/hooks/useTimesheet";
import TimesheetGrid from "../../../components/timesheet/TimesheetGrid";
import { exportTimesheetToExcel } from "@/lib/export/exportTimesheetToExcel";
import BulkActionsBar from "@/components/timesheet/BulkActionsBar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getAuthData } from "@/lib/auth-utils";
import { driverService } from "@/service/driverService";
import { convoyService } from "@/service/convoyService";
import type { DisplayDriver, DriverStatus } from "@/types/driver.types";

export default function TimesheetPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [reloadKey, setReloadKey] = useState(0);

  const [totalDrivers, setTotalDrivers] = useState(0);
  const [drivers, setDrivers] = useState<DisplayDriver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);

  const [authLoaded, setAuthLoaded] = useState(false);
  const [auth, setAuth] = useState({
    convoyId: "",
    convoyNumber: "—",
    busDepotId: "",
    role: "User",
  });

  useEffect(() => {
    const a = getAuthData();
    if (a) {
      setAuth({
        convoyId: a.convoyId ?? "",
        convoyNumber: a.convoyNumber ?? "—",
        busDepotId: a.busDepotId ?? "",
        role: a.role ?? "User",
      });
    }
    setAuthLoaded(true);
  }, []);

  const canViewAll = auth.role === "Admin" || auth.role === "DispatcherAdmin";
  const [viewAll, setViewAll] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "All">("All");

  useEffect(() => {
    if (!authLoaded) return;

    async function loadDrivers() {
      setLoadingDrivers(true);
      try {
        let convoyId = auth.convoyId;

        if (!convoyId && auth.busDepotId) {
          const res = await convoyService.getByDepotId(auth.busDepotId);
          convoyId = res.value?.[0]?.id ?? "";
        }

        const trimmedSearch = searchApplied.trim();
        const isServiceNumber = /^\d+$/.test(trimmedSearch);
        const fullName = trimmedSearch && !isServiceNumber ? trimmedSearch : null;
        const serviceNumber = trimmedSearch && isServiceNumber ? trimmedSearch : null;
        const driverStatus = statusFilter === "All" ? null : statusFilter;

        const res = await driverService.filter({
          convoyId: viewAll ? null : convoyId,
          fullName,
          serviceNumber,
          address: null,
          phone: null,
          driverStatus,
          page,
          pageSize,
        });

        setDrivers(
          (res.value?.items || []).map((d) => ({
            id: d.id!,
            fullName: d.fullName,
            serviceNumber: d.serviceNumber,
            driverStatus: d.driverStatus,
          }))
        );
        setTotalDrivers(res.value?.totalCount || 0);
      } finally {
        setLoadingDrivers(false);
      }
    }

    loadDrivers();
  }, [authLoaded, viewAll, page, pageSize, auth.busDepotId, auth.convoyId, searchApplied, statusFilter]);

  const { rows, days, loading, monthlyTotals } = useTimesheet({
    drivers,
    year,
    month0,
    page,
    pageSize,
    reloadKey,
  });

  const mmYYYY = useMemo(
    () => new Date(year, month0, 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" }),
    [year, month0]
  );

  const totalPages = Math.max(1, Math.ceil(totalDrivers / pageSize));

  function prevMonth() {
    const d = new Date(year, month0, 1);
    d.setMonth(d.getMonth() - 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  }

  function nextMonth() {
    const d = new Date(year, month0, 1);
    d.setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  }

  function handleFiltersSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchApplied(searchDraft.trim());
    setPage(1);
  }

  function resetFilters() {
    setSearchDraft("");
    setSearchApplied("");
    setStatusFilter("All");
    setPage(1);
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-2xl font-bold">Табель рабочего времени</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevMonth}>← Пред</Button>
          <div className="px-3 py-2 border rounded">{mmYYYY}</div>
          <Button variant="outline" onClick={nextMonth}>След →</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm text-gray-600">
          Автоколонна: <span className="font-semibold">№{auth.convoyNumber}</span>
        </div>
        {canViewAll && (
          <div className="flex items-center gap-2">
            <Switch
              id="viewAll"
              checked={viewAll}
              onCheckedChange={(value) => {
                setViewAll(value);
                setPage(1);
              }}
            />
            <Label htmlFor="viewAll">Показать все колонны</Label>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Label htmlFor="pageSize">Размер страницы</Label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="h-9 px-2 border rounded"
          >
            {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            exportTimesheetToExcel({
              rows,
              days,
              year,
              month0,
              convoyNumber: viewAll ? "ALL" : auth.convoyNumber,
            })
          }
          disabled={!rows.length}
        >
          Экспорт в Excel
        </Button>
      </div>

      <form onSubmit={handleFiltersSubmit} className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <Label htmlFor="search">Поиск</Label>
          <input
            id="search"
            type="text"
            className="h-9 px-3 border rounded"
            placeholder="ФИО или таб. номер"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="status">Статус</Label>
          <select
            id="status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as DriverStatus | "All");
              setPage(1);
            }}
            className="h-9 px-2 border rounded"
          >
            <option value="All">Все статусы</option>
            <option value="OnWork">На линии</option>
            <option value="DayOff">Выходной</option>
            <option value="OnVacation">Отпуск</option>
            <option value="OnSickLeave">Больничный</option>
            <option value="Intern">Стажировка</option>
            <option value="Fired">Уволен</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Применить</Button>
          {(searchApplied || statusFilter !== "All") && (
            <Button type="button" variant="ghost" onClick={resetFilters}>
              Сбросить
            </Button>
          )}
        </div>
      </form>

      <BulkActionsBar rows={rows} year={year} month0={month0} onDone={() => setReloadKey((k) => k + 1)} />

      {(loading || loadingDrivers) ? (
        <div className="text-gray-500">Загрузка...</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-500">Нет данных</div>
      ) : (
        <>
          <TimesheetGrid
            rows={rows}
            days={days}
            year={year}
            month0={month0}
            startIndex={(page - 1) * pageSize}
            onSavedReload={() => setReloadKey((k) => k + 1)}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-600">
              Всего водителей: {totalDrivers}. Стр. {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Назад
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Вперед
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2 text-sm mt-2">
            <SummaryItem label="Отработано" value={monthlyTotals.worked} />
            <SummaryItem label="Выходных" value={monthlyTotals.dayOff} />
            <SummaryItem label="Отпуск" value={monthlyTotals.vacation} />
            <SummaryItem label="Больничный" value={monthlyTotals.sick} />
            <SummaryItem label="Стажировка" value={monthlyTotals.intern} />
            <SummaryItem label="Уволен" value={monthlyTotals.fired} />
          </div>
        </>
      )}
    </div>
  );
}function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-2 flex items-center justify-between">
      <div className="text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

