// TimesheetPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTimesheet } from "@/hooks/useTimesheet";
import TimesheetGrid from "@/components/timesheet/TimesheetGrid";
import { exportTimesheetToExcel } from "@/lib/export/exportTimesheetToExcel";
import BulkActionsBar from "@/components/timesheet/BulkActionsBar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getAuthData } from "@/lib/auth-utils";
import { driverService } from "@/service/driverService";
import { convoyService } from "@/service/convoyService";
import type { DisplayDriver } from "@/types/driver.types";

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

        const res = await driverService.filter({
          convoyId: viewAll ? null : convoyId,
          fullName: null,
          serviceNumber: null,
          address: null,
          phone: null,
          driverStatus: null,
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
  }, [authLoaded, viewAll, page, pageSize, auth.busDepotId, auth.convoyId]);

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
            <Switch id="viewAll" checked={viewAll} onCheckedChange={(v) => { setViewAll(v); setPage(1); }} />
            <Label htmlFor="viewAll">Показать весь парк</Label>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Label htmlFor="pageSize">Размер страницы</Label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-9 px-2 border rounded"
          >
            {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((n) => (
              <option key={n} value={n}>{n}</option>
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

      <BulkActionsBar
        rows={rows}
        year={year}
        month0={month0}
        onDone={() => setReloadKey((k) => k + 1)}
      />

      {(loading || loadingDrivers) ? (
        <div className="text-gray-500">Загрузка…</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-500">Нет данных</div>
      ) : (
        <>
          <TimesheetGrid
              rows={rows}
              days={days}
              year={year}
              month0={month0}
              onSavedReload={() => setReloadKey((k) => k + 1)}
            />
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-600">
              Всего водителей: {totalDrivers}. Стр. {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Назад</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Вперёд</Button>
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
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-2 flex items-center justify-between">
      <div className="text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
