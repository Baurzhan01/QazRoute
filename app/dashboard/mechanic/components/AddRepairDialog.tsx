"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { repairBusService } from "@/service/repairBusService";
import { sparePartsService } from "@/service/sparePartsService";
import type { CreateRepairRequest, Repair } from "@/types/repairBus.types";
import type { SparePart, LaborTime } from "@/types/spareParts.types";

import AutocompleteInput from "./AutocompleteInput";

// --- Хелперы ---
function parseDec(value?: string): number {
  if (!value) return 0;
  const normalized = value.replace(",", ".").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function roundSparePrice(price: number): number {
  const intPart = Math.floor(price);
  const frac = price - intPart;
  return frac >= 0.5 ? Math.ceil(price) : Math.floor(price);
}

// --- Тип строки ---
type RowDraft = {
  busId?: string;
  applicationNumber?: number;
  departureDate?: string;
  entryDate?: string;

  // ID для бэка
  sparePartId?: string | null;
  laborTimeId?: string | null;

  // UI поля
  workName?: string;
  sparePart?: string;

  workCode?: string;
  sparePartArticle?: string;

  // Для редактирования чисел строками
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
    setWorks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addRow() {
    setWorks((prev) => [...prev, {}]);
  }

  function removeRow(index: number) {
    setWorks((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  }

  async function submit() {
    if (!busId || works.length === 0) return;
    setSaving(true);
    try {
      const payload: CreateRepairRequest[] = works.map((w) => ({
        busId,
        applicationNumber:
          applicationNumber === "" ? 0 : Number(applicationNumber),
        departureDate:
          departureDateStr || new Date().toISOString().slice(0, 10),
        entryDate: entryDateStr || new Date().toISOString().slice(0, 10),

        // реальные ID
        sparePartId: w.sparePartId || null,
        sparePartCount: parseDec(w.sparePartCount),

        laborTimeId: w.laborTimeId || null,
        workCount: parseDec(w.workCount),
        workHour: parseDec(w.workHour),
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

  // --- Общие итоги ---
  const totals = works.reduce(
    (acc, w) => {
      acc.work += parseDec(w.workHour) * parseDec(w.workPrice);
      acc.parts += parseDec(w.sparePartCount) * parseDec(w.sparePartPrice);
      return acc;
    },
    { work: 0, parts: 0 }
  );
  const totalSum = totals.work + totals.parts;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Добавить запись</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Новая ремонтная запись</DialogTitle>
        </DialogHeader>

        {/* --- Верхние поля --- */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>№ заявки</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={applicationNumber}
              onChange={(e) =>
                setApplicationNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Напр. 51636"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Дата выезда</Label>
            <Input
              type="date"
              value={departureDateStr}
              onChange={(e) => setDepartureDateStr(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Дата въезда</Label>
            <Input
              type="date"
              value={entryDateStr}
              onChange={(e) => setEntryDateStr(e.target.value)}
            />
          </div>
        </div>

        {/* --- Строки работ/запчастей --- */}
        <div className="mt-6">
          <div className="max-h-[450px] overflow-y-auto pr-2 space-y-8">
            {works.map((w, idx) => {
              const workSum =
                parseDec(w.workHour) * parseDec(w.workPrice) || 0;
              const partSum =
                parseDec(w.sparePartCount) * parseDec(w.sparePartPrice) || 0;

              return (
                <div
                  key={idx}
                  className="border rounded-md p-4 space-y-4 bg-white"
                >
                  {/* Работа */}
                  <AutocompleteInput<LaborTime>
                    label="Код операции"
                    placeholder="Введите код операции"
                    value={w.workCode || ""}
                    onChange={(val) => updateWork(idx, "workCode", val)}
                    fetchOptions={async (q) => {
                      const res = await sparePartsService.searchLaborTime(q);
                      return res.isSuccess && res.value ? res.value : [];
                    }}
                    renderOption={(l) => (
                      <div>
                        <div className="font-medium">
                          {l.operationCode} — {l.operationName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {l.busModel}
                        </div>
                      </div>
                    )}
                    onSelect={(l) => {
                      updateWork(idx, "laborTimeId", l.id);
                      updateWork(idx, "workCode", l.operationCode);
                      updateWork(idx, "workName", l.operationName);

                      updateWork(
                        idx,
                        "workCount",
                        l.quantity != null ? String(l.quantity) : "1"
                      );

                      updateWork(
                        idx,
                        "workHour",
                        l.hours != null ? String(l.hours) : "0"
                      );

                      updateWork(idx, "workPrice", "9000");
                    }}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Кол-во (ед.)</Label>
                      <Input
                        value={w.workCount || ""}
                        onChange={(e) =>
                          updateWork(idx, "workCount", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Часы</Label>
                      <Input
                        value={w.workHour || ""}
                        onChange={(e) =>
                          updateWork(idx, "workHour", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Цена работы (₸)</Label>
                      <Input
                        value={w.workPrice || ""}
                        onChange={(e) =>
                          updateWork(idx, "workPrice", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Запчасть */}
                  <AutocompleteInput<SparePart>
                    label="Артикул"
                    placeholder="Введите артикул"
                    value={w.sparePartArticle || ""}
                    onChange={(val) =>
                      updateWork(idx, "sparePartArticle", val)
                    }
                    fetchOptions={async (q) => {
                      const res = await sparePartsService.searchByArticle(q);
                      return res.isSuccess && res.value ? res.value : [];
                    }}
                    renderOption={(p) => (
                      <div>
                        <div className="font-medium">
                          {p.article} — {p.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.busModel} · {roundSparePrice(p.unitPrice)} ₸
                        </div>
                      </div>
                    )}
                    onSelect={(p) => {
                      updateWork(idx, "sparePartId", p.id);
                      updateWork(idx, "sparePartArticle", p.article);
                      updateWork(idx, "sparePart", p.name);
                      updateWork(
                        idx,
                        "sparePartPrice",
                        String(roundSparePrice(p.unitPrice))
                      );
                      updateWork(idx, "sparePartCount", "1");
                    }}
                  />
                  <div>
                    <Label>Наименование запчасти</Label>
                    <Input
                      value={w.sparePart || ""}
                      onChange={(e) =>
                        updateWork(idx, "sparePart", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Кол-во (шт.)</Label>
                      <Input
                        value={w.sparePartCount || ""}
                        onChange={(e) =>
                          updateWork(idx, "sparePartCount", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Цена за ед. (₸)</Label>
                      <Input
                        value={w.sparePartPrice || ""}
                        onChange={(e) =>
                          updateWork(idx, "sparePartPrice", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Итого (₸)</Label>
                      <Input value={String(partSum)} readOnly />
                    </div>
                  </div>

                  {/* Итог по строке */}
                  <div className="text-right font-medium text-sm text-slate-600">
                    Всего по строке: {(workSum + partSum).toLocaleString("ru-RU")} ₸
                  </div>

                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeRow(idx)}
                  >
                    Удалить строку
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Button variant="outline" onClick={addRow}>
              + Добавить строку
            </Button>
          </div>
        </div>

        {/* --- Общий итог --- */}
        <div className="mt-6 bg-slate-50 border rounded-md p-4">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-blue-600">
              Работы: {totals.work.toLocaleString("ru-RU")} ₸
            </span>
            <span className="text-orange-600">
              Запчасти: {totals.parts.toLocaleString("ru-RU")} ₸
            </span>
            <span className="text-green-600">
              Всего: {totalSum.toLocaleString("ru-RU")} ₸
            </span>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
