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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { repairBusService } from "@/service/repairBusService";
import { sparePartsService } from "@/service/sparePartsService";
import type { Repair, CreateRepairRequest } from "@/types/repairBus.types";
import type { SparePart, LaborTime } from "@/types/spareParts.types";

import SearchInput from "./SearchInput";

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

// --- Локальный тип строки ---
type RowDraft = {
  sparePartId?: string | null;
  laborTimeId?: string | null;

  workName?: string;
  sparePart?: string;
  workCode?: string;
  sparePartArticle?: string;

  workCount?: string;
  workHour?: string;
  workPrice?: string;
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
  onUpdated: (updated: Repair) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<RowDraft>({});

  useEffect(() => {
    if (repair) {
      setDraft({
        laborTimeId: repair.laborTimeId ?? null,
        sparePartId: repair.sparePartId ?? null,
        workCode: repair.workCode ?? "",
        workName: repair.workName ?? "",
        sparePart: repair.sparePart ?? "",
        sparePartArticle: repair.sparePartArticle ?? "",
        workCount: repair.workCount ? String(repair.workCount) : "",
        workHour: repair.workHour ? String(repair.workHour) : "",
        workPrice: repair.workPrice ? String(repair.workPrice) : "",
        sparePartCount: repair.sparePartCount
          ? String(repair.sparePartCount)
          : "",
        sparePartPrice: repair.sparePartPrice
          ? String(repair.sparePartPrice)
          : "",
      });
    }
  }, [repair]);

  function update(field: keyof RowDraft, value: string | null) {
    setDraft((prev) => ({ ...prev, [field]: value ?? undefined }));
  }

  function removeWork() {
    setDraft((prev) => ({
      ...prev,
      laborTimeId: null,
      workCode: "",
      workName: "",
      workCount: "",
      workHour: "",
      workPrice: "",
    }));
  }

  function removeSpare() {
    setDraft((prev) => ({
      ...prev,
      sparePartId: null,
      sparePartArticle: "",
      sparePart: "",
      sparePartCount: "",
      sparePartPrice: "",
    }));
  }

  async function submit() {
    if (!repair) return;
    setSaving(true);
    try {
      const payload: CreateRepairRequest = {
        busId: repair.busId,
        applicationNumber: repair.applicationNumber ?? 0,
        departureDate:
          repair.departureDate ?? new Date().toISOString().slice(0, 10),
        entryDate: repair.entryDate ?? new Date().toISOString().slice(0, 10),

        sparePartId: draft.sparePartId ?? null,
        sparePartCount: parseDec(draft.sparePartCount),

        laborTimeId: draft.laborTimeId ?? null,
        workCount: parseDec(draft.workCount),
        workHour: parseDec(draft.workHour),
      };

      const res = await repairBusService.update(repair.id, payload);
      if (res.isSuccess && res.value) {
        onUpdated(res.value);
        onClose();
      } else {
        console.error("Ошибка обновления ремонта:", res.error);
      }
    } finally {
      setSaving(false);
    }
  }

  const totals = {
    work:
      parseDec(draft.workCount) *
      parseDec(draft.workHour) *
      parseDec(draft.workPrice),
    parts:
      parseDec(draft.sparePartCount) * parseDec(draft.sparePartPrice),
  };
  const totalSum = totals.work + totals.parts;

  return (
    <Dialog open={!!repair} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Редактировать ремонт</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="works" className="mt-2">
          <TabsList>
            <TabsTrigger value="works">🔧 Работы</TabsTrigger>
            <TabsTrigger value="spares">🛠️ Запчасти</TabsTrigger>
          </TabsList>

          {/* Работы */}
          <TabsContent value="works" className="space-y-4 mt-4">
            <SearchInput<LaborTime>
              label="Код операции"
              placeholder="Введите код операции"
              value={draft.workCode || ""}
              onChange={(val) => update("workCode", val)}
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
                update("laborTimeId", l.id);
                update("workCode", l.operationCode);
                update("workName", l.operationName);
                update("workCount", l.quantity != null ? String(l.quantity) : "1");
                update("workHour", l.hours != null ? String(l.hours) : "0");
                update("workPrice", "9000");
              }}
            />
            <div>
              <Label>Наименование работы</Label>
              <Input
                value={draft.workName || ""}
                onChange={(e) => update("workName", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label>Кол-во (ед.)</Label>
                <Input
                  value={draft.workCount || ""}
                  onChange={(e) => update("workCount", e.target.value)}
                />
              </div>
              <div>
                <Label>Часы</Label>
                <Input
                  value={draft.workHour || ""}
                  onChange={(e) => update("workHour", e.target.value)}
                />
              </div>
              <div>
                <Label>Цена работы (₸)</Label>
                <Input
                  value={draft.workPrice || ""}
                  onChange={(e) => update("workPrice", e.target.value)}
                />
              </div>
              <div>
                <Label>Сумма работы (₸)</Label>
                <Input
                  value={String(totals.work)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              className="text-red-600 mt-2"
              onClick={removeWork}
            >
              Удалить работу
            </Button>
          </TabsContent>

          {/* Запчасти */}
          <TabsContent value="spares" className="space-y-4 mt-4">
            <SearchInput<SparePart>
              label="Артикул"
              placeholder="Введите артикул"
              value={draft.sparePartArticle || ""}
              onChange={(val) => update("sparePartArticle", val)}
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
                update("sparePartId", p.id);
                update("sparePartArticle", p.article);
                update("sparePart", p.name);
                update("sparePartPrice", String(roundSparePrice(p.unitPrice)));
                update("sparePartCount", "1");
              }}
            />
            <div>
              <Label>Наименование запчасти</Label>
              <Input
                value={draft.sparePart || ""}
                onChange={(e) => update("sparePart", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Кол-во (шт.)</Label>
                <Input
                  value={draft.sparePartCount || ""}
                  onChange={(e) => update("sparePartCount", e.target.value)}
                />
              </div>
              <div>
                <Label>Цена з/ч (₸)</Label>
                <Input
                  value={draft.sparePartPrice || ""}
                  onChange={(e) => update("sparePartPrice", e.target.value)}
                />
              </div>
              <div>
                <Label>Сумма запчастей (₸)</Label>
                <Input
                  value={String(totals.parts)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              className="text-red-600 mt-2"
              onClick={removeSpare}
            >
              Удалить запчасть
            </Button>
          </TabsContent>
        </Tabs>

        {/* Общая сумма */}
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
