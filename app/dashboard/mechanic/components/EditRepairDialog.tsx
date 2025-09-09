"use client";

import { useMemo, useState } from "react";
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
import { repairBusService } from "@/service/repairBusService";
import type { UpdateRepairRequest, Repair } from "@/types/repairBus.types";

type Props = {
  repair: Repair;
  onClose: () => void;
  onUpdated: (updated: Repair) => void;
};

function toNum(v: string | number | "" | null | undefined): number {
  if (v === "" || v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function EditRepairDialog({ repair, onClose, onUpdated }: Props) {
  // базовые поля
  const [applicationNumber, setApplicationNumber] = useState<number | "">(
    typeof repair.applicationNumber === "number" ? repair.applicationNumber : ""
  );

  // запчасти
  const [sparePart, setSparePart] = useState<string>(repair.sparePart ?? "");
  const [sparePartCount, setSparePartCount] = useState<number | "">(
    typeof repair.sparePartCount === "number" ? repair.sparePartCount : ""
  );
  const [sparePartPrice, setSparePartPrice] = useState<number | "">(
    typeof repair.sparePartPrice === "number" ? repair.sparePartPrice : ""
  );

  // работы
  const [workName, setWorkName] = useState<string>(repair.workName ?? "");
  const [workCount, setWorkCount] = useState<number | "">(
    typeof repair.workCount === "number" ? repair.workCount : ""
  );
  const [workHour, setWorkHour] = useState<number | "">(
    typeof repair.workHour === "number" ? repair.workHour : ""
  );
  const [workPrice, setWorkPrice] = useState<number | "">(
    typeof repair.workPrice === "number" ? repair.workPrice : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // подсчёты (для наглядности)
  const calc = useMemo(() => {
    const spCount = toNum(sparePartCount);
    const spPrice = toNum(sparePartPrice);
    const wHour = toNum(workHour);
    const wPrice = toNum(workPrice);

    return {
      spareSum: spCount * spPrice,
      workSum: wHour * wPrice,
    };
  }, [sparePartCount, sparePartPrice, workHour, workPrice]);

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      // лёгкая валидация
      if (!applicationNumber && applicationNumber !== 0) {
        setError("Заполните номер заявки (можно 0).");
        setSaving(false);
        return;
      }

      const payload: UpdateRepairRequest = {
        applicationNumber: toNum(applicationNumber),
        sparePart: sparePart ?? "",
        sparePartCount: toNum(sparePartCount),
        sparePartPrice: toNum(sparePartPrice),
        workName: workName ?? "",
        workCount: toNum(workCount),
        workHour: toNum(workHour),
        workPrice: toNum(workPrice),
      };

      const res = await repairBusService.update(repair.id, payload);

      // бэк возвращает обновлённую сущность Repair
      onUpdated(res.value);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование записи</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {/* № заявки */}
          <div className="space-y-1.5">
            <Label>№ заявки</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={applicationNumber}
              onChange={(e) =>
                setApplicationNumber(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />
          </div>

          {/* инфо (только для контекста) */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Автобус</Label>
            <div className="text-sm text-muted-foreground">
              {repair.garageNumber ?? "—"} / {repair.govNumber ?? "—"}
            </div>
          </div>

          {/* Запчасти */}
          <div className="space-y-1.5">
            <Label>Запчасть (наименование)</Label>
            <Input
              value={sparePart}
              onChange={(e) => setSparePart(e.target.value)}
              placeholder="Например, Антифриз"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Кол-во, шт.</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={sparePartCount}
                onChange={(e) =>
                  setSparePartCount(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="шт."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Цена з/ч, ₸</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={sparePartPrice}
                onChange={(e) =>
                  setSparePartPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="₸"
              />
            </div>
          </div>

          {/* Работы */}
          <div className="space-y-1.5 md:col-span-2">
            <Label>Работа / кол-во / часы / цена</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input
                placeholder="Наименование работы"
                value={workName}
                onChange={(e) => setWorkName(e.target.value)}
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder="ед."
                value={workCount}
                onChange={(e) =>
                  setWorkCount(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder="ч"
                value={workHour}
                onChange={(e) =>
                  setWorkHour(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder="₸"
                value={workPrice}
                onChange={(e) =>
                  setWorkPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          {/* Подсуммы (для наглядности) */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground">Сумма по запчастям</div>
              <div className="font-medium">
                {calc.spareSum.toLocaleString("ru-RU")} ₸
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground">Сумма по работам</div>
              <div className="font-medium">
                {calc.workSum.toLocaleString("ru-RU")} ₸
              </div>
            </div>
          </div>

          {error && (
            <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
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
