"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { repairBusService } from "@/service/repairBusService";
import type { CreateRepairRequest, Repair } from "@/types/repairBus.types";

type RowDraft = Omit<
  Partial<CreateRepairRequest>,
  "workCount" | "workHour" | "workPrice" | "sparePartCount" | "sparePartPrice"
> & {
  workCount?: string;
  workHour?: string;
  workPrice?: string;
  sparePartCount?: string;
  sparePartPrice?: string;
};

export default function AddRepairDialog({
  busId,
  onCreated,
  trigger,
}: {
  busId: string;
  onCreated: (created: Repair[]) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState<string>("");
  const [departureDateStr, setDepartureDateStr] = useState("");
  const [entryDateStr, setEntryDateStr] = useState("");
  const [saving, setSaving] = useState(false);

  const [works, setWorks] = useState<RowDraft[]>([{}]);

  function updateWork(index: number, field: keyof RowDraft, value: string) {
    setWorks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addRow() {
    setWorks(prev => [...prev, {}]);
  }

  function removeRow(index: number) {
    setWorks(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  // Мягкий парс дробного числа: "0,5" -> 0.5, ""/","/"." -> 0
  function parseDec(value?: string): number {
    if (!value) return 0;
    const normalized = value.replace(",", ".").trim();
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  // Парс целого (для кол-ва запчастей можно тоже дробь, если нужно — используй parseDec)
  function parseIntSafe(value?: string): number {
    if (!value) return 0;
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  async function submit() {
    if (!busId || works.length === 0) return;
    setSaving(true);
    try {
      const payload: CreateRepairRequest[] = works
        .filter(w => (w.workName?.trim() || w.sparePart?.trim()))
        .map(w => ({
          busId,
          applicationNumber: applicationNumber === "" ? 0 : Number(applicationNumber),
          sparePart: w.sparePart?.trim() || "",
          sparePartCount: parseDec(w.sparePartCount),   // если нужно строго целое — замени на parseIntSafe
          sparePartPrice: parseDec(w.sparePartPrice),
          departureDate: departureDateStr || new Date().toISOString().slice(0, 10),
          entryDate: entryDateStr || new Date().toISOString().slice(0, 10),
          workName: w.workName?.trim() || "",
          workCount: parseDec(w.workCount),
          workHour: parseDec(w.workHour),               // <- теперь "0,5" сохранится как 0.5
          workPrice: parseDec(w.workPrice),
        }));

      if (payload.length === 0) return;

      const res = await repairBusService.createBatch(payload);
      onCreated(res.value ?? []);
      setOpen(false);
      setWorks([{}]);
      setApplicationNumber("");
      setDepartureDateStr("");
      setEntryDateStr("");
    } finally {
      setSaving(false);
    }
  }

  // Разрешаем ввод только цифр, одна запятая/точка, пустую строку и ведущий 0
  function numericInputProps(value: string | undefined, onChange: (v: string) => void) {
    return {
      value: value ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        // допускаем цифры, пробелы убираем, меняем запятую на запятую/точку только на парсинге
        // здесь лишь ограничим набор
        if (/^[0-9]*[.,]?[0-9]*$/.test(v) || v === "") {
          onChange(v);
        }
      },
      inputMode: "decimal" as const,
    };
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Добавить запись</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Новая ремонтная запись</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>№ заявки</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={applicationNumber}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "");
                setApplicationNumber(v);
              }}
              placeholder="Напр. 51636"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Дата выезда</Label>
            <Input type="date" value={departureDateStr} onChange={e => setDepartureDateStr(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Дата въезда</Label>
            <Input type="date" value={entryDateStr} onChange={e => setEntryDateStr(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 space-y-8">
          {works.map((w, idx) => (
            <div key={idx} className="border rounded-md p-4 space-y-4">
              <div className="grid grid-cols-6 gap-2 items-end">
                <div className="col-span-2">
                  <Label>Наименование работы</Label>
                  <Input
                    placeholder="Напр. Замена диска"
                    value={w.workName || ""}
                    onChange={e => updateWork(idx, "workName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Кол-во (ед.)</Label>
                  <Input
                    type="text"
                    {...numericInputProps(w.workCount, v => updateWork(idx, "workCount", v))}
                  />
                </div>
                <div>
                  <Label>Часы</Label>
                  <Input
                    type="text"
                    {...numericInputProps(w.workHour, v => updateWork(idx, "workHour", v))}
                  />
                </div>
                <div>
                  <Label>Цена работы (₸)</Label>
                  <Input
                    type="text"
                    {...numericInputProps(w.workPrice, v => updateWork(idx, "workPrice", v))}
                  />
                </div>
                <Button variant="ghost" className="text-red-600" onClick={() => removeRow(idx)}>
                  Удалить
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <Label>Наименование запчасти</Label>
                  <Input
                    placeholder="Напр. Тормозной диск"
                    value={w.sparePart || ""}
                    onChange={e => updateWork(idx, "sparePart", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Кол-во (шт.)</Label>
                  <Input
                    type="text"
                    {...numericInputProps(w.sparePartCount, v => updateWork(idx, "sparePartCount", v))}
                  />
                </div>
                <div>
                  <Label>Цена з/ч (₸)</Label>
                  <Input
                    type="text"
                    {...numericInputProps(w.sparePartPrice, v => updateWork(idx, "sparePartPrice", v))}
                  />
                </div>
              </div>
            </div>
          ))}

          <div>
            <Button variant="outline" onClick={addRow}>+ Добавить строку</Button>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Сохранение…" : "Сохранить"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
