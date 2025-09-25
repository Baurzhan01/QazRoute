"use client";

import { useState } from "react";
import clsx from "clsx";
import EditDayStatusDialog from "./EditDayStatusDialog";
import {
  TimesheetDayStatus,
  dayLabel,
  ymd,
  statusToColor,
} from "../../lib/utils/timesheet";

// типы для входных данных
interface Driver {
  id: string;
  fullName: string;
  serviceNumber?: string | null;
}

interface DayCell {
  status: TimesheetDayStatus;
  routeAndExit?: string | null;
}

interface Row {
  driver: Driver;
  days: Record<number, DayCell | undefined>;
  totals: {
    worked: number;
    dayOff: number;
    vacation: number;
    sick: number;
    intern: number;
    fired: number;
  };
}

interface TimesheetGridProps {
  rows: Row[];
  days: number[];
  year: number;
  month0: number;
  startIndex: number;
  onSavedReload?: () => void;
}

export default function TimesheetGrid({
  rows,
  days,
  year,
  month0,
  startIndex,
  onSavedReload,
}: TimesheetGridProps) {
  const [modal, setModal] = useState<{
    open: boolean;
    driverId: string | null;
    date: string | null;
    status: TimesheetDayStatus;
  }>({
    open: false,
    driverId: null,
    date: null,
    status: "Empty",
  });

  return (
    <div className="overflow-x-auto border rounded">
      {/* Header */}
      <div className="flex sticky top-0 bg-gray-50 z-10 border-b">
        <div className="min-w-[40px] px-2 py-2 text-sm text-center border-r font-semibold text-gray-700">
          №
        </div>
        <div className="min-w-[240px] px-3 py-2 border-r font-semibold text-gray-700 sticky left-10 bg-gray-50 z-10">
          Водитель
        </div>
        <div className="flex gap-1 px-2 py-2">
          {days.map((t) => (
            <div
              key={t}
              className="min-w-[42px] h-9 rounded border text-xs font-semibold flex items-center justify-center bg-gray-100"
            >
              {t}
            </div>
          ))}
        </div>
        <div className="flex gap-1 px-2 py-2 sticky right-0 bg-gray-50 border-l">
          {["Раб.", "Вых.", "Отп.", "Бол.", "Стаж.", "Увол."].map((h, i) => (
            <div
              key={i}
              className="min-w-[52px] h-9 rounded border text-xs font-semibold flex items-center justify-center"
            >
              {h}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {rows.map((r, idx) => (
        <div key={r.driver.id} className="flex border-b hover:bg-gray-50/40">
          <div className="min-w-[40px] px-2 py-2 text-sm text-center border-r text-gray-500">
            {startIndex + idx + 1}
          </div>
          <div className="min-w-[240px] px-3 py-2 border-r sticky left-10 bg-white z-10">
            <div className="font-medium">{shortFIO(r.driver.fullName)}</div>
            <div className="text-xs text-gray-500">
              Таб. № {r.driver.serviceNumber || "—"}
            </div>
          </div>

          <div className="flex gap-1 px-2 py-1">
            {days.map((d) => {
              const cell = r.days[d];
              const st = cell?.status ?? "Empty";
              const label = dayLabel[st] ?? "";
              const { route, exit } = parseRouteAndExit(cell?.routeAndExit);
              const title =
                st === "Worked"
                  ? `Рабочий день${
                      route || exit
                        ? `\nМаршрут: ${route ?? "-"}\nВыход: ${exit ?? "-"}`
                        : ""
                    }`
                  : labelFor(st);

              return (
                <button
                  key={d}
                  title={title}
                  onClick={() => openEdit(r.driver.id, d, st)}
                  className={clsx(
                    "min-w-[42px] h-9 rounded border text-xs font-semibold flex items-center justify-center",
                    statusToColor(st)
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1 px-2 py-1 sticky right-0 bg-white border-l">
            {[
              r.totals.worked,
              r.totals.dayOff,
              r.totals.vacation,
              r.totals.sick,
              r.totals.intern,
              r.totals.fired,
            ].map((v, i) => (
              <div
                key={i}
                className="min-w-[52px] h-9 rounded border text-xs flex items-center justify-center"
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      ))}

      <EditDayStatusDialog
        open={modal.open}
        onOpenChange={(v: boolean) => setModal((m) => ({ ...m, open: v }))}
        driverId={modal.driverId ?? ""}
        date={modal.date ?? ""}
        initial={modal.status}
        onSaved={() => onSavedReload?.()}
      />
    </div>
  );

  function openEdit(
    driverId: string,
    dayNum: number,
    status: TimesheetDayStatus
  ) {
    const date = ymd(new Date(year, month0, dayNum));
    setModal({ open: true, driverId, date, status });
  }

  function parseRouteAndExit(value?: string | null) {
    if (!value) return { route: null, exit: null };
    const [rawRoute = null, rawExit = null] = value
      .split("/")
      .map((part) => part.trim());
    return {
      route: rawRoute && rawRoute.length ? rawRoute : null,
      exit: rawExit && rawExit.length ? rawExit : null,
    };
  }

  function labelFor(s: TimesheetDayStatus) {
    switch (s) {
      case "DayOff":
        return "Выходной";
      case "OnVacation":
        return "Отпуск";
      case "OnSickLeave":
        return "Больничный";
      case "Intern":
        return "Стажировка";
      case "Fired":
        return "Уволен";
      case "Worked":
        return "Работал";
      default:
        return "—";
    }
  }
}

function shortFIO(fullName: string): string {
  const [last, first = "", middle = ""] = fullName.split(" ");
  const initials = `${first?.charAt(0)}.${middle?.charAt(0)}.`;
  return `${last} ${initials}`;
}
