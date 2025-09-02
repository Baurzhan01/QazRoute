"use client";

import { useEffect, useMemo, useState } from "react";
import { driverService, type DriverWorkHistoryItem } from "@/service/driverService";
import type { DisplayDriver } from "@/types/driver.types";
import { getMonthDays, type TimesheetDayStatus } from "@/lib/utils/timesheet";

export type TimesheetRow = {
  driver: DisplayDriver;
  days: Record<
    number,
    {
      status: TimesheetDayStatus;
      routeAndExit?: string | null;
      raw?: DriverWorkHistoryItem | null;
    }
  >;
  totals: {
    worked: number;
    dayOff: number;
    vacation: number;
    sick: number;
    intern: number;
    fired: number;
    empty: number;
  };
};

export function useTimesheet({
  drivers,
  year,
  month0,
  page,
  pageSize,
  reloadKey,
}: {
  drivers: DisplayDriver[];
  year: number;
  month0: number;
  page: number;
  pageSize: number;
  reloadKey: number;
}) {
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => getMonthDays(year, month0), [year, month0]);

  // ВАЖНО: drivers уже приходят постранично с сервера — но если вдруг придут все,
  // этот slice не повредит.
  const pageDrivers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return drivers.slice(start, start + pageSize);
  }, [drivers, page, pageSize]);

  useEffect(() => {
    if (!pageDrivers.length) {
      setRows([]);
      return;
    }

    const startDate = new Date(year, month0, 1).toISOString().split("T")[0];

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          pageDrivers.map(async (driver) => {
            // 🔧 Унифицированное чтение ответа: массив ИЛИ { value: [...] }
            const res = await driverService.getWorkHistory(driver.id, startDate, days.length);
            const value: DriverWorkHistoryItem[] = Array.isArray(res)
              ? res
              : (res?.value ?? []);

            const map: TimesheetRow["days"] = {};
            days.forEach((d) => {
              map[d] = { status: "Empty", raw: null };
            });

            value.forEach((item) => {
              const dateObj = new Date(item.date);
              if (dateObj.getFullYear() === year && dateObj.getMonth() === month0) {
                const n = dateObj.getDate();
                map[n] = {
                  status: normalizeStatus(item.status),
                  routeAndExit: item.routeAndExit,
                  raw: item,
                };
              }
            });

            const totals = calcTotals(map, days);
            return { driver, days: map, totals };
          })
        );

        if (!cancelled) setRows(results);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageDrivers, year, month0, days, reloadKey]);

  const monthlyTotals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.worked += r.totals.worked;
        acc.dayOff += r.totals.dayOff;
        acc.vacation += r.totals.vacation;
        acc.sick += r.totals.sick;
        acc.intern += r.totals.intern;
        acc.fired += r.totals.fired;
        acc.empty += r.totals.empty;
        return acc;
      },
      {
        worked: 0,
        dayOff: 0,
        vacation: 0,
        sick: 0,
        intern: 0,
        fired: 0,
        empty: 0,
      }
    );
  }, [rows]);

  return {
    rows,
    days,
    loading,
    totalDrivers: drivers.length,
    monthlyTotals,
  };
}

/**
 * Приводим статус из бэкенда/истории к enum таблицы.
 * Поддерживаем и EN-коды бэкенда, и RU подписи.
 */
function normalizeStatus(s: string | null | undefined): TimesheetDayStatus {
  if (!s) return "Empty";

  // Сразу отдаём, если уже одно из целевых значений
  switch (s) {
    case "Worked":
    case "DayOff":
    case "OnVacation":
    case "OnSickLeave":
    case "Intern":
    case "Fired":
    case "Empty":
      return s;
  }

  // EN-коды бэкенда
  switch (s) {
    case "OnWork":
      return "Worked";
    case "DayOff":
      return "DayOff";
    case "OnVacation":
      return "OnVacation";
    case "OnSickLeave":
      return "OnSickLeave";
    case "Intern":
      return "Intern";
    case "Fired":
      return "Fired";
  }

  // RU-строки (если где-то ещё могут прийти)
  switch (s) {
    case "Работал":
      return "Worked";
    case "Выходной":
      return "DayOff";
    case "Отпуск":
      return "OnVacation";
    case "Больничный":
      return "OnSickLeave";
    case "Стажировка":
      return "Intern";
    case "Уволен":
      return "Fired";
    default:
      return "Empty";
  }
}

function calcTotals(map: TimesheetRow["days"], days: number[]) {
  let worked = 0,
    dayOff = 0,
    vacation = 0,
    sick = 0,
    intern = 0,
    fired = 0,
    empty = 0;
  for (const n of days) {
    const s = map[n]?.status || "Empty";
    switch (s) {
      case "Worked":
        worked++;
        break;
      case "DayOff":
        dayOff++;
        break;
      case "OnVacation":
        vacation++;
        break;
      case "OnSickLeave":
        sick++;
        break;
      case "Intern":
        intern++;
        break;
      case "Fired":
        fired++;
        break;
      default:
        empty++;
    }
  }
  return { worked, dayOff, vacation, sick, intern, fired, empty };
}
