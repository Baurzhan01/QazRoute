"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import type { TimesheetDayStatus } from "@/lib/utils/timesheet";
import { dayLabel, ymd } from "@/lib/utils/timesheet";
import type { TimesheetRow } from "@/hooks/useTimesheet";
import EditDayStatusDialog from "./EditDayStatusDialog";

function shortFIO(fullName: string): string {
  const [last, first = "", middle = ""] = fullName.split(" ");
  return `${last} ${first[0] ?? ""}.${middle[0] ?? ""}.`;
}

export default function TimesheetGrid({
  rows,
  days,
  year,
  month0,
  onSavedReload,
}: {
  rows: TimesheetRow[];
  days: number[];
  year: number;
  month0: number;
  onSavedReload?: () => void;
}) {
  const [modal, setModal] = useState<{
    open: boolean;
    driverId: string;
    date: string;
    status: TimesheetDayStatus;
  }>({ open: false, driverId: "", date: "", status: "Empty" });

  const headerDays = useMemo(
    () =>
      days.map((d) => (
        <div key={d} className="min-w-[42px] text-center text-xs font-medium text-gray-600">
          {d}
        </div>
      )),
    [days]
  );

  return (
    <div className="border rounded-md overflow-auto">
      {/* Header */}
      <div className="flex sticky top-0 bg-white z-10 border-b">
        <div className="min-w-[40px] px-2 py-2 text-xs font-semibold text-gray-600 border-r text-center">
          №
        </div>
        <div className="min-w-[240px] px-3 py-2 font-semibold text-gray-700 border-r">
          Водитель
        </div>
        <div className="flex gap-1 px-2 py-2">{headerDays}</div>
        <div className="flex gap-1 px-2 py-2 sticky right-0 bg-white border-l">
          {["Итог Р", "Итог В", "Отп", "Бол", "Стаж", "Ув"].map((t) => (
            <div
              key={t}
              className="min-w-[52px] text-center text-xs font-semibold text-gray-700"
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {rows.map((r, idx) => (
        <div key={r.driver.id} className="flex border-b hover:bg-gray-50/40">
          <div className="min-w-[40px] px-2 py-2 text-sm text-center border-r text-gray-500">
            {idx + 1}
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
              const routeText =
                cell?.routeAndExit?.includes("/") && st === "Worked"
                  ? `Маршрут: ${cell.routeAndExit.split("/")[0]}\nВыход: ${cell.routeAndExit.split("/")[1]}`
                  : "";
              const title =
                st === "Worked"
                  ? `Работал${routeText ? `\n${routeText}` : ""}`
                  : labelFor(st);

              return (
                <button
                  key={d}
                  title={title}
                  onClick={() =>
                    openEdit(r.driver.id, d, st)
                  }
                  className={clsx(
                    "min-w-[42px] h-9 rounded border text-xs font-bold flex items-center justify-center",
                    st === "Worked" && "bg-green-100 border-green-300 text-green-800",
                    st === "DayOff" && "bg-red-100 border-red-300 text-red-700",
                    st === "OnVacation" && "bg-yellow-100 border-yellow-300 text-yellow-800",
                    st === "OnSickLeave" && "bg-blue-100 border-blue-300 text-blue-800",
                    st === "Intern" && "bg-purple-100 border-purple-300 text-purple-800",
                    st === "Fired" && "bg-gray-200 border-gray-300 text-gray-700",
                    st === "Empty" && "bg-white border-gray-200 text-gray-700"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1 px-2 py-1 sticky right-0 bg-white border-l">
            {[r.totals.worked, r.totals.dayOff, r.totals.vacation, r.totals.sick, r.totals.intern, r.totals.fired].map(
              (v, i) => (
                <div
                  key={i}
                  className="min-w-[52px] h-9 rounded border text-xs flex items-center justify-center"
                >
                  {v}
                </div>
              )
            )}
          </div>
        </div>
      ))}

      <EditDayStatusDialog
        open={modal.open}
        onOpenChange={(v) => setModal((m) => ({ ...m, open: v }))}
        driverId={modal.driverId}
        date={modal.date}
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
