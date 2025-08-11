// components/driver/DriverWorkHistory.tsx
"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDriverWorkHistory } from "../../../../../../../hooks/useDriverWorkHistory";
import type { DriverWorkHistoryItem } from "@/service/driverService";

interface Props {
  driverId: string | null;
  defaultStartDate: string; // YYYY-MM-DD — обычно дата разнарядки
  defaultDays?: number;     // по умолчанию 7
  title?: string;           // кастомный заголовок
  onParamsChange?: (p: { startDate: string; days: number }) => void;
  className?: string;
}

export default function DriverWorkHistory({
  driverId,
  defaultStartDate,
  defaultDays = 7,
  title = "История работы",
  onParamsChange,
  className,
}: Props) {
  const [params, setParams] = useState({ startDate: defaultStartDate, days: defaultDays });
  const { data, loading } = useDriverWorkHistory(driverId, params.startDate, params.days);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // если поменяли дату разнарядки снаружи — синхронизируем
    setParams((prev) => ({ ...prev, startDate: defaultStartDate }));
  }, [defaultStartDate]);

  useEffect(() => {
    onParamsChange?.(params);
  }, [params, onParamsChange]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-semibold">
          {title} за последние {params.days} дн.
        </Label>
        <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} title="Изменить период">
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Загрузка…</div>
      ) : !data.length ? (
        <div className="text-sm text-gray-500">Нет данных</div>
      ) : (
        <DayGrid items={data} />
      )}

      <Legend />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        startDate={params.startDate}
        days={params.days}
        onApply={(next) => setParams(next)}
      />
    </div>
  );
}

function parseRouteAndExit(routeAndExit?: string | null): { route?: string; exit?: string } {
  if (!routeAndExit) return {};
  const [route, exit] = routeAndExit.split("/").map((s) => s.trim());
  return { route, exit };
}

function DayGrid({ items }: { items: DriverWorkHistoryItem[] }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-7 gap-2">
        {items.map((d) => {
          const isOff = d.status === "Выходной";
          const letter = isOff ? "В" : "Р";
          const classes = isOff
            ? "bg-red-100 border-red-300 text-red-700"
            : "bg-green-100 border-green-300 text-green-700";
          const { route, exit } = parseRouteAndExit(d.routeAndExit);

          // fallback title для нативного tooltip браузера
          const nativeTitle = isOff
            ? `${d.date}: ${d.status}`
            : `${d.date}: ${d.status}${
                route || exit ? `\nМаршрут № ${route ?? "-"}\nВыход № ${exit ?? "-"}` : ""
              }`;

          return (
            <Tooltip key={d.date}>
              <TooltipTrigger asChild>
                <div
                  title={nativeTitle}
                  className={`h-10 w-10 rounded-md border text-sm font-bold flex items-center justify-center ${classes}`}
                >
                  {letter}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="text-xs">
                <div className="font-medium">{d.date}</div>
                <div>{d.status}</div>
                {!isOff && (route || exit) && (
                  <div className="mt-1 leading-4">
                    <div>Маршрут № {route ?? "-"}</div>
                    <div>Выход № {exit ?? "-"}</div>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function Legend() {
  return (
    <div className="flex gap-4 mt-3 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span className="inline-block h-4 w-4 rounded bg-green-200 border border-green-300" />
        Работал
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-4 w-4 rounded bg-red-200 border border-red-300" />
        Выходной
      </div>
    </div>
  );
}

function SettingsDialog({
  open, onClose, startDate, days, onApply,
}: {
  open: boolean; onClose: () => void;
  startDate: string; days: number;
  onApply: (next: { startDate: string; days: number }) => void;
}) {
  const [localDate, setLocalDate] = useState(startDate);
  const [localDays, setLocalDays] = useState(days);

  useEffect(() => {
    setLocalDate(startDate);
    setLocalDays(days);
  }, [startDate, days, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Параметры истории</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Дата отчёта</Label>
            <input
              type="date"
              className="col-span-3 border rounded-md h-9 px-3"
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Дней</Label>
            <input
              type="number"
              min={1}
              className="col-span-3 border rounded-md h-9 px-3"
              value={localDays}
              onChange={(e) => setLocalDays(Math.max(1, Number(e.target.value || 1)))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={() => { onApply({ startDate: localDate, days: localDays }); onClose(); }}>
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
