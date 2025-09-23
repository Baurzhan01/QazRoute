"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { repairBusService } from "@/service/repairBusService";
import { sparePartsService } from "@/service/sparePartsService";
import type { Repair, CreateRepairRequest } from "@/types/repairBus.types";
import type { SparePart, LaborTime } from "@/types/spareParts.types";

import SearchInput from "./SearchInput";

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

type RowDraft = {
  id?: string;
  type: "work" | "spare";
  laborTimeId?: string | null;
  sparePartId?: string | null;
  workCode?: string;
  workName?: string;
  workCount?: string;
  workHour?: string;
  workPrice?: string;
  sparePart?: string;
  sparePartArticle?: string;
  sparePartCount?: string;
  sparePartPrice?: string;
};

export default function EditRepairDialog({
  repair,
  onClose,
  onUpdated,
}: {
  repair: Repair;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [rows, setRows] = useState<RowDraft[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (repair) {
      const initial: RowDraft = {
        id: repair.id,
        type: repair.workName ? "work" : "spare",
        laborTimeId: repair.laborTimeId ?? null,
        sparePartId: repair.sparePartId ?? null,
        workCode: repair.workCode ?? "",
        workName: repair.workName ?? "",
        workCount: repair.workCount ? String(repair.workCount) : "",
        workHour: repair.workHour ? String(repair.workHour) : "",
        workPrice: repair.workPrice ? String(repair.workPrice) : "",
        sparePart: repair.sparePart ?? "",
        sparePartArticle: repair.sparePartArticle ?? "",
        sparePartCount: repair.sparePartCount
          ? String(repair.sparePartCount)
          : "",
        sparePartPrice: repair.sparePartPrice
          ? String(repair.sparePartPrice)
          : "",
      };
      setRows([initial]);
    }
  }, [repair]);

  function updateRow(index: number, field: keyof RowDraft, value: string | null) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value ?? undefined };
      return next;
    });
  }

  async function removeRow(index: number) {
    const row = rows[index];
    if (row.id) {
      if (!confirm("Удалить запись ремонта?")) return;
      await repairBusService.remove(row.id);
      setRows((prev) => prev.filter((_, i) => i !== index));
      onUpdated();
    } else {
      setRows((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function addRow(type: "work" | "spare") {
    setRows((prev) => [
      ...prev,
      { type, workCount: "1", workHour: "0", workPrice: "0", sparePartCount: "1", sparePartPrice: "0" },
    ]);
  }

  async function submit() {
    setSaving(true);
    try {
      const newRows = rows.filter((r) => !r.id);
      if (newRows.length > 0) {
        const payload: CreateRepairRequest[] = newRows.map((r) => ({
          busId: repair.busId,
          applicationNumber: repair.applicationNumber ?? 0,
          departureDate:
            repair.departureDate ?? new Date().toISOString().slice(0, 10),
          entryDate:
            repair.entryDate ?? new Date().toISOString().slice(0, 10),
          laborTimeId: r.laborTimeId ?? null,
          workCount: parseDec(r.workCount),
          workHour: parseDec(r.workHour),
          sparePartId: r.sparePartId ?? null,
          sparePartCount: parseDec(r.sparePartCount),
        }));
        await repairBusService.createBatch(payload);
      }
      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const totals = rows.reduce(
    (acc, r) => {
      if (r.type === "work") {
        acc.work +=
          parseDec(r.workCount) * parseDec(r.workHour) * parseDec(r.workPrice);
      } else {
        acc.parts += parseDec(r.sparePartCount) * parseDec(r.sparePartPrice);
      }
      return acc;
    },
    { work: 0, parts: 0 }
  );
  const totalSum = totals.work + totals.parts;

  return (
    <Dialog open={!!repair} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать заказ-наряд</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="works" className="mt-2">
          <TabsList>
            <TabsTrigger value="works">🔧 Работы</TabsTrigger>
            <TabsTrigger value="spares">🛠️ Запчасти</TabsTrigger>
          </TabsList>

          {/* Работы */}
          <TabsContent value="works" className="space-y-4 mt-4">
            {rows
              .map((r, i) => ({ ...r, index: i }))
              .filter((r) => r.type === "work")
              .map((r) => (
                <div key={r.index} className="border rounded-md p-3 space-y-2">
                  <SearchInput<LaborTime>
                    label="Код операции"
                    placeholder="Введите код операции"
                    value={r.workCode || ""}
                    onChange={(val) => updateRow(r.index, "workCode", val)}
                    fetchOptions={async (q) => {
                      const res = await sparePartsService.searchLaborTime(q);
                      return res.isSuccess && res.value ? res.value : [];
                    }}
                    renderOption={(l) => (
                      <div>
                        <div className="font-medium">
                          {l.operationCode} — {l.operationName}
                        </div>
                        <div className="text-xs text-gray-500">{l.busModel}</div>
                      </div>
                    )}
                    onSelect={(l) => {
                      updateRow(r.index, "laborTimeId", l.id);
                      updateRow(r.index, "workCode", l.operationCode);
                      updateRow(r.index, "workName", l.operationName);
                      updateRow(r.index, "workCount", String(l.quantity ?? 1));
                      updateRow(r.index, "workHour", String(l.hours ?? 0));
                      updateRow(r.index, "workPrice", "9000");
                    }}
                  />
                  <Input
                    value={r.workName || ""}
                    onChange={(e) =>
                      updateRow(r.index, "workName", e.target.value)
                    }
                    placeholder="Наименование работы"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      value={r.workCount || ""}
                      onChange={(e) => updateRow(r.index, "workCount", e.target.value)}
                      placeholder="Кол-во"
                    />
                    <Input
                      value={r.workHour || ""}
                      onChange={(e) => updateRow(r.index, "workHour", e.target.value)}
                      placeholder="Часы"
                    />
                    <Input
                      value={r.workPrice || ""}
                      onChange={(e) => updateRow(r.index, "workPrice", e.target.value)}
                      placeholder="Цена"
                    />
                    <Input
                      value={String(
                        parseDec(r.workCount) *
                          parseDec(r.workHour) *
                          parseDec(r.workPrice)
                      )}
                      readOnly
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeRow(r.index)}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => addRow("work")}
            >
              ➕ Добавить работу
            </Button>
          </TabsContent>

          {/* Запчасти */}
          <TabsContent value="spares" className="space-y-4 mt-4">
            {rows
              .map((r, i) => ({ ...r, index: i }))
              .filter((r) => r.type === "spare")
              .map((r) => (
                <div key={r.index} className="border rounded-md p-3 space-y-2">
                  <SearchInput<SparePart>
                    label="Артикул"
                    placeholder="Введите артикул"
                    value={r.sparePartArticle || ""}
                    onChange={(val) =>
                      updateRow(r.index, "sparePartArticle", val)
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
                      updateRow(r.index, "sparePartId", p.id);
                      updateRow(r.index, "sparePartArticle", p.article);
                      updateRow(r.index, "sparePart", p.name);
                      updateRow(
                        r.index,
                        "sparePartPrice",
                        String(roundSparePrice(p.unitPrice))
                      );
                      updateRow(r.index, "sparePartCount", "1");
                    }}
                  />
                  <Input
                    value={r.sparePart || ""}
                    onChange={(e) =>
                      updateRow(r.index, "sparePart", e.target.value)
                    }
                    placeholder="Наименование запчасти"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={r.sparePartCount || ""}
                      onChange={(e) =>
                        updateRow(r.index, "sparePartCount", e.target.value)
                      }
                      placeholder="Кол-во"
                    />
                    <Input
                      value={r.sparePartPrice || ""}
                      onChange={(e) =>
                        updateRow(r.index, "sparePartPrice", e.target.value)
                      }
                      placeholder="Цена"
                    />
                    <Input
                      value={String(
                        parseDec(r.sparePartCount) *
                          parseDec(r.sparePartPrice)
                      )}
                      readOnly
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeRow(r.index)}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => addRow("spare")}
            >
              ➕ Добавить запчасть
            </Button>
          </TabsContent>
        </Tabs>

        {/* Итог */}
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
          <Button variant="outline" onClick={onClose}>
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
