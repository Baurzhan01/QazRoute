"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { repairBusService } from "@/service/repairBusService";
import { type UpdateRepairRequest, type Repair } from "@/types/repairBus.types";

export default function EditRepairDialog({
  repair,
  onClose,
  onUpdated,
}: {
  repair: Repair;
  onClose: () => void;
  onUpdated: (updated: Repair) => void;
}) {
  const [applicationNumber, setApplicationNumber] = useState<number | "">(repair.applicationNumber ?? "");
  const [sparePart, setSparePart] = useState(repair.sparePart ?? "");
  const [sparePartCount, setSparePartCount] = useState<number | "">(repair.sparePartCount ?? "");
  const [sparePartPrice, setSparePartPrice] = useState<number | "">(repair.sparePartPrice ?? "");
  const [workName, setWorkName] = useState(repair.workName ?? "");
  const [workCount, setWorkCount] = useState<number | "">(repair.workCount ?? "");
  const [workHour, setWorkHour] = useState<number | "">(repair.workHour ?? "");
  const [workPrice, setWorkPrice] = useState<number | "">(repair.workPrice ?? "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      const payload: UpdateRepairRequest = {
        applicationNumber: Number(applicationNumber) || 0,
        sparePart: sparePart || "",
        sparePartCount: Number(sparePartCount) || 0,
        sparePartPrice: Number(sparePartPrice) || 0,
        workName: workName || "",
        workCount: Number(workCount) || 0,
        workHour: Number(workHour) || 0,
        workPrice: Number(workPrice) || 0,
      };
      const res = await repairBusService.update(repair.id, payload);
      onUpdated(res.value);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Редактирование записи</DialogTitle></DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>№ заявки</Label>
            <Input type="number" inputMode="numeric" value={applicationNumber}
              onChange={(e) => setApplicationNumber(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>

          <div className="space-y-1.5">
            <Label>Запчасть</Label>
            <Input value={sparePart} onChange={(e) => setSparePart(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Кол-во / Цена (з/ч)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" inputMode="numeric" placeholder="шт." value={sparePartCount}
                onChange={(e) => setSparePartCount(e.target.value === "" ? "" : Number(e.target.value))} />
              <Input type="number" inputMode="numeric" placeholder="₸" value={sparePartPrice}
                onChange={(e) => setSparePartPrice(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>Работа / кол-во / часы / цена</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input placeholder="Наименование" value={workName} onChange={(e) => setWorkName(e.target.value)} />
              <Input type="number" inputMode="numeric" placeholder="ед." value={workCount}
                onChange={(e) => setWorkCount(e.target.value === "" ? "" : Number(e.target.value))} />
              <Input type="number" inputMode="numeric" placeholder="ч" value={workHour}
                onChange={(e) => setWorkHour(e.target.value === "" ? "" : Number(e.target.value))} />
              <Input type="number" inputMode="numeric" placeholder="₸" value={workPrice}
                onChange={(e) => setWorkPrice(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Сохранение…" : "Сохранить"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
