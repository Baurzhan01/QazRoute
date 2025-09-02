"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { driverService } from "@/service/driverService";
import { toast } from "@/components/ui/use-toast";
import type { TimesheetDayStatus } from "@/lib/utils/timesheet";

const OPTIONS: { value: TimesheetDayStatus; label: string }[] = [
  { value: "Worked", label: "Работал (по назначению)" },
  { value: "DayOff", label: "Выходной" },
  { value: "OnVacation", label: "Отпуск" },
  { value: "OnSickLeave", label: "Больничный" },
  { value: "Intern", label: "Стажировка" },
  { value: "Fired", label: "Уволен" },
];

export default function EditDayStatusDialog({
  open,
  onOpenChange,
  driverId,
  date,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  driverId: string;
  date: string; // YYYY-MM-DD
  initial: TimesheetDayStatus;
  onSaved: (next: TimesheetDayStatus) => void;
}) {
  const [value, setValue] = useState<TimesheetDayStatus>(initial);
  const [saving, setSaving] = useState(false);

  // 🧠 Инициализация при открытии новой ячейки
  useEffect(() => {
    if (open) setValue(initial);
  }, [open, initial, driverId, date]);

  async function save() {
    try {
      setSaving(true);
      const backendStatus = value === "Worked" ? "OnWork" : value;
      const res = await driverService.setDailyStatus(driverId, date, backendStatus as any);
      if (!res.isSuccess) throw new Error(res.error || "Ошибка");

      toast({ title: "Сохранено" });
      onSaved(value);
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Не удалось сохранить", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Изменить статус дня — {date}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Статус</Label>
            <Select value={value} onValueChange={(v) => setValue(v as TimesheetDayStatus)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button disabled={saving} onClick={save}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
