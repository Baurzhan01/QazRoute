"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { driverService } from "@/service/driverService";
import { toast } from "@/components/ui/use-toast";
import type { TimesheetRow } from "@/hooks/useTimesheet";

export default function BulkActionsBar({
  rows,
  year,
  month0,
  onDone,
}: {
  rows: TimesheetRow[];
  year: number;
  month0: number;
  onDone: () => void;
}) {
  const firstDay = toYMD(new Date(year, month0, 1));
  const lastDay = toYMD(new Date(year, month0 + 1, 0));
  const [from, setFrom] = useState<string>(firstDay);
  const [to, setTo] = useState<string>(lastDay);
  const [saving, setSaving] = useState(false);

  async function markDayOffForUnassigned() {
    try {
      setSaving(true);
      const fromD = new Date(from);
      const toD = new Date(to);
      if (fromD > toD) throw new Error("Некорректный диапазон дат");

      const days: string[] = [];
      for (let d = new Date(fromD); d <= toD; d.setDate(d.getDate() + 1)) {
        days.push(toYMD(d));
      }

      const jobs: Promise<any>[] = [];
      for (const r of rows) {
        for (const date of days) {
          const d = new Date(date);
          if (d.getFullYear() !== year || d.getMonth() !== month0) continue;
          const dayNum = d.getDate();
          const st = r.days[dayNum]?.status || "Empty";
          if (st === "Empty" || st === "DayOff") {
            jobs.push(driverService.setDailyStatus(r.driver.id, date, "DayOff"));
          }
        }
      }

      const result = await Promise.allSettled(jobs);
      const failed = result.filter((r) => r.status === "rejected");
      if (failed.length) {
        toast({
          title: `Готово с ошибками`,
          description: `Не удалось обновить ${failed.length} записей`,
          variant: "destructive",
        });
      } else {
        toast({ title: "Готово", description: "Статусы выставлены" });
      }
      onDone();
    } catch (e: any) {
      toast({
        title: "Ошибка",
        description: String(e?.message || e),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-3 border rounded-md bg-white">
      <div className="grid gap-1">
        <Label>С даты</Label>
        <input
          type="date"
          className="h-9 px-3 border rounded"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <Label>По дату</Label>
        <input
          type="date"
          className="h-9 px-3 border rounded"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <Button onClick={markDayOffForUnassigned} disabled={saving}>
        Сформировать
      </Button>
    </div>
  );
}

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
