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
  page: _page,
  pageSize: _pageSize,
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

  useEffect(() => {
    if (!drivers.length) {
      setRows([]);
      return;
    }

    const lastDay = new Date(year, month0 + 1, 0).getDate();
    const startDate = `${year}-${String(month0 + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          drivers.map(async (driver) => {
            // 🔧 Унифицированное чтение ответа: массив ИЛИ { value: [...] }
            const res = await driverService.getWorkHistory(driver.id, startDate, lastDay);
            const history = extractHistory(res);

            const map: TimesheetRow["days"] = {};
            days.forEach((d) => {
              map[d] = { status: "Empty", raw: null };
            });

            history.forEach((item) => {
              const dateObj = new Date(item.date);
              if (Number.isNaN(dateObj.getTime())) return;
              if (dateObj.getFullYear() === year && dateObj.getMonth() === month0) {
                const n = dateObj.getDate();
                const normalized = normalizeStatus(item.status, item.routeAndExit);
                map[n] = {
                  status: normalized === "Empty" && item.routeAndExit ? "Worked" : normalized,
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
  }, [drivers, year, month0, days, reloadKey]);

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
function normalizeStatus(s: string | null | undefined, routeAndExit?: string | null): TimesheetDayStatus {
  if (!s) return routeAndExit ? "Worked" : "Empty";

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

  // EN-строки от бэкенда
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

  // RU-строки (идём по подстрокам, чтобы не зависеть от падежей)
  const lower = s.toLowerCase();
  if (lower.includes("работ")) return "Worked";
  if (lower.includes("выход")) return "DayOff";
  if (lower.includes("отп")) return "OnVacation";
  if (lower.includes("бол")) return "OnSickLeave";
  if (lower.includes("стаж")) return "Intern";
  if (lower.includes("увол")) return "Fired";

  return routeAndExit ? "Worked" : "Empty";
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
function extractHistory(res: unknown): DriverWorkHistoryItem[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as DriverWorkHistoryItem[];
  const value = (res as { value?: unknown }).value;
  return Array.isArray(value) ? (value as DriverWorkHistoryItem[]) : [];
}




