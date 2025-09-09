"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { repairBusService } from "@/service/repairBusService";
import { toDateOnlyDto, type CreateRepairRequest, type Repair } from "@/types/repairBus.types";

export default function AddRepairDialog({
    busId,
    onCreated,
    trigger,
  }: {
    busId: string;
    onCreated: (created: Repair) => void;
    trigger?: React.ReactNode; // ← НОВОЕ
  }) {
  const [open, setOpen] = useState(false);

  const [applicationNumber, setApplicationNumber] = useState<number | "">("");
  const [sparePart, setSparePart] = useState("");
  const [sparePartCount, setSparePartCount] = useState<number | "">("");
  const [sparePartPrice, setSparePartPrice] = useState<number | "">("");
  const [departureDateStr, setDepartureDateStr] = useState("");
  const [entryDateStr, setEntryDateStr] = useState("");
  const [workName, setWorkName] = useState("");
  const [workCount, setWorkCount] = useState<number | "">("");
  const [workHour, setWorkHour] = useState<number | "">("");
  const [workPrice, setWorkPrice] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!busId) return;
    setSaving(true);
    try {
      const payload: CreateRepairRequest = {
        busId,
        applicationNumber: Number(applicationNumber) || 0,
        sparePart: sparePart || "",
        sparePartCount: Number(sparePartCount) || 0,
        sparePartPrice: Number(sparePartPrice) || 0,
        departureDate: departureDateStr ? toDateOnlyDto(departureDateStr) : toDateOnlyDto(new Date()),
        entryDate: entryDateStr ? toDateOnlyDto(entryDateStr) : toDateOnlyDto(new Date()),
        workName: workName || "",
        workCount: Number(workCount) || 0,
        workHour: Number(workHour) || 0,
        workPrice: Number(workPrice) || 0,
      };
      const res = await repairBusService.create(payload);
      onCreated(res.value);
      setOpen(false);
      // очистим форму
      setApplicationNumber(""); setSparePart(""); setSparePartCount(""); setSparePartPrice("");
      setDepartureDateStr(""); setEntryDateStr(""); setWorkName(""); setWorkCount(""); setWorkHour(""); setWorkPrice("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Добавить запись</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Новая ремонтная запись</DialogTitle></DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>№ заявки</Label>
            <Input type="number" inputMode="numeric" value={applicationNumber}
              onChange={(e) => setApplicationNumber(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Напр. 51636" />
          </div>

          <div className="space-y-1.5">
            <Label>Запчасть</Label>
            <Input value={sparePart} onChange={(e) => setSparePart(e.target.value)} placeholder="Антифриз" />
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

          <div className="space-y-1.5">
            <Label>Дата выезда</Label>
            <Input type="date" value={departureDateStr} onChange={(e) => setDepartureDateStr(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Дата въезда</Label>
            <Input type="date" value={entryDateStr} onChange={(e) => setEntryDateStr(e.target.value)} />
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
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Сохранение…" : "Сохранить"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
