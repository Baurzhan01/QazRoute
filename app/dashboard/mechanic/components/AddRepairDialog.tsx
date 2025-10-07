"use client";

import { useRef, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { repairBusService } from "@/service/repairBusService";
import { sparePartsService } from "@/service/sparePartsService";
import type { CreateRepairRequest, Repair } from "@/types/repairBus.types";
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

// --- Типы ---
type WorkDraft = {
  laborTimeId?: string | null;
  workCode?: string;
  workName?: string;
  workCount?: string;
  workHour?: string;
  workPrice?: string;
};
type SpareDraft = {
  sparePartId?: string | null;
  sparePartArticle?: string;
  sparePart?: string;
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

  const [registerNumber, setRegisterNumber] = useState<string>(""); // 👈 новый ввод
  const [applicationNumber, setApplicationNumber] = useState<string>("");

  const [appNumberError, setAppNumberError] = useState<string | null>(null);
  const [checkingAppNumber, setCheckingAppNumber] = useState(false);

  const [departureDateStr, setDepartureDateStr] = useState("");
  const [entryDateStr, setEntryDateStr] = useState("");
  const [saving, setSaving] = useState(false);

  const [works, setWorks] = useState<WorkDraft[]>([{}]);
  const [spares, setSpares] = useState<SpareDraft[]>([{}]);
   // --- ссылки для автоскролла ---
  const worksEndRef = useRef<HTMLDivElement | null>(null);
  const sparesEndRef = useRef<HTMLDivElement | null>(null);

  function scrollToEnd(ref: React.RefObject<HTMLDivElement | null>) {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function updateWork(index: number, field: keyof WorkDraft, value: string) {
    setWorks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }
  function updateSpare(index: number, field: keyof SpareDraft, value: string) {
    setSpares((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addWorkRow() {
    setWorks((prev) => [...prev, {}]);
    scrollToEnd(worksEndRef);
  }
  function addSpareRow() {
    setSpares((prev) => [...prev, {}]);
    scrollToEnd(sparesEndRef);
  }

  function removeWorkRow(index: number) {
    setWorks((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  }
  function removeSpareRow(index: number) {
    setSpares((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  }

  async function validateApplicationNumber(num: string) {
    if (!num) {
      setAppNumberError("Введите номер заявки");
      return false;
    }
    setCheckingAppNumber(true);
    try {
      const res = await repairBusService.checkApplicationNumber(Number(num));
      if (res.isSuccess) {
        setAppNumberError(null);
        return true;
      }
      setAppNumberError(res.error || "Такой номер заявки уже существует");
      return false;
    } finally {
      setCheckingAppNumber(false);
    }
  }

  async function submit() {
    if (!busId || !registerNumber) {
      setAppNumberError("Номер реестра обязателен");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateRepairRequest[] = [
        ...works.map((w) => ({
          busId,
          registerNumber, // 👈 теперь всегда указываем реестр
          applicationNumber: applicationNumber === "" ? 0 : Number(applicationNumber),
          departureDate: departureDateStr || new Date().toISOString().slice(0, 10),
          entryDate: entryDateStr || new Date().toISOString().slice(0, 10),
          laborTimeId: w.laborTimeId || null,
          workCount: parseDec(w.workCount),
          workHour: parseDec(w.workHour),
          workPrice: parseDec(w.workPrice),
          sparePartId: null,
          sparePartCount: 0,
          sparePartPrice: 0,
        })),
        ...spares.map((s) => ({
          busId,
          registerNumber, // 👈 обязательно
          applicationNumber: applicationNumber === "" ? 0 : Number(applicationNumber),
          departureDate: departureDateStr || new Date().toISOString().slice(0, 10),
          entryDate: entryDateStr || new Date().toISOString().slice(0, 10),
          sparePartId: s.sparePartId || null,
          sparePartArticle: s.sparePartArticle || null,
          sparePart: s.sparePart || null,
          sparePartCount: parseDec(s.sparePartCount),
          sparePartPrice: parseDec(s.sparePartPrice),
          laborTimeId: null,
          workCount: 0,
          workHour: 0,
          workPrice: 0,
        })),
      ];

      const res = await repairBusService.createBatch(payload);
      onCreated(res.value ?? []);
      setOpen(false);
      setWorks([{}]);
      setSpares([{}]);
      setApplicationNumber("");
      setRegisterNumber("");
      setDepartureDateStr("");
      setEntryDateStr("");
    } finally {
      setSaving(false);
    }
  }

  const totals = {
    work: works.reduce(
      (sum, w) => sum + parseDec(w.workCount) * parseDec(w.workHour) * parseDec(w.workPrice),
      0
    ),
    parts: spares.reduce(
      (sum, s) => sum + parseDec(s.sparePartCount) * parseDec(s.sparePartPrice),
      0
    ),
  };
  const totalSum = totals.work + totals.parts;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Добавить запись</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Новая ремонтная запись</DialogTitle>
        </DialogHeader>

        {/* Верхние поля */}
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>№ реестра</Label>
            <Input
              type="text"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              placeholder="Напр. R-2025-01"
            />
          </div>
          <div>
            <Label>№ заявки</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={applicationNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setApplicationNumber(val);
                if (!val) setAppNumberError("Введите номер заявки");
                else setAppNumberError(null);
              }}
              onBlur={() => {
                if (applicationNumber) validateApplicationNumber(applicationNumber);
              }}
              placeholder="Напр. 51636"
            />
            {appNumberError && (
              <p className="text-red-600 text-sm mt-1">{appNumberError}</p>
            )}
          </div>
          <div>
            <Label>Дата выезда</Label>
            <Input
              type="date"
              value={departureDateStr}
              onChange={(e) => setDepartureDateStr(e.target.value)}
            />
          </div>
          <div>
            <Label>Дата въезда</Label>
            <Input
              type="date"
              value={entryDateStr}
              onChange={(e) => setEntryDateStr(e.target.value)}
            />
          </div>
        </div>

        {/* Табы */}
        <Tabs defaultValue="works" className="mt-6">
          <TabsList>
            <TabsTrigger value="works">🔧 Работы</TabsTrigger>
            <TabsTrigger value="spares">🛠️ Запчасти</TabsTrigger>
          </TabsList>

          {/* Работы */}
          <TabsContent value="works" className="mt-4 max-h-[50vh] overflow-y-auto">
            {works.map((w, idx) => {
              const workSum = parseDec(w.workCount) * parseDec(w.workHour) * parseDec(w.workPrice) || 0;
              return (
                <div key={idx} className="border rounded-md p-4 space-y-4 bg-white mb-4">
                  <SearchInput<LaborTime>
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
                        <div className="font-medium">{l.operationCode} — {l.operationName}</div>
                        <div className="text-xs text-gray-500">{l.busModel}</div>
                      </div>
                    )}
                    onSelect={(l) => {
                      updateWork(idx, "laborTimeId", l.id);
                      updateWork(idx, "workCode", l.operationCode);
                      updateWork(idx, "workName", l.operationName);
                      updateWork(idx, "workCount", l.quantity ? String(l.quantity) : "1");
                      updateWork(idx, "workHour", l.hours ? String(l.hours) : "0");
                      updateWork(idx, "workPrice", "9000");
                    }}
                  />
                  <div>
                    <Label>Наименование работы</Label>
                    <Input
                      value={w.workName || ""}
                      onChange={(e) => updateWork(idx, "workName", e.target.value)}
                      placeholder="Введите или выберите работу"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label>Кол-во</Label>
                      <Input value={w.workCount || ""} onChange={(e) => updateWork(idx, "workCount", e.target.value)} />
                    </div>
                    <div>
                      <Label>Часы</Label>
                      <Input value={w.workHour || ""} onChange={(e) => updateWork(idx, "workHour", e.target.value)} />
                    </div>
                    <div>
                      <Label>Цена работы (₸)</Label>
                      <Input value={w.workPrice || ""} onChange={(e) => updateWork(idx, "workPrice", e.target.value)} />
                    </div>
                    <div>
                      <Label>Сумма (₸)</Label>
                      <Input value={String(workSum)} readOnly className="bg-gray-50" />
                    </div>
                  </div>
                  <Button variant="ghost" className="text-red-600" onClick={() => removeWorkRow(idx)}>
                    Удалить работу
                  </Button>
                </div>
              );
            })}
            <div ref={worksEndRef} /> {/* 👈 сюда прокручивает */}
            <Button variant="outline" onClick={addWorkRow}>+ Добавить работу</Button>
          </TabsContent>

          {/* Запчасти */}
          <TabsContent value="spares"  className="mt-4 max-h-[50vh] overflow-y-auto">
            {spares.map((s, idx) => {
              const partSum = parseDec(s.sparePartCount) * parseDec(s.sparePartPrice) || 0;
              return (
                <div key={idx} className="border rounded-md p-4 space-y-4 bg-white mb-4">
                  <SearchInput<SparePart>
                    label="Артикул"
                    placeholder="Введите артикул"
                    value={s.sparePartArticle || ""}
                    onChange={(val) => updateSpare(idx, "sparePartArticle", val)}
                    fetchOptions={async (q) => {
                      const res = await sparePartsService.searchByArticle(q);
                      return res.isSuccess && res.value ? res.value : [];
                    }}
                    renderOption={(p) => (
                      <div>
                        <div className="font-medium">{p.article} — {p.name}</div>
                        <div className="text-xs text-gray-500">{p.busModel} · {roundSparePrice(p.unitPrice)} ₸</div>
                      </div>
                    )}
                    onSelect={(p) => {
                      updateSpare(idx, "sparePartId", p.id);
                      updateSpare(idx, "sparePartArticle", p.article);
                      updateSpare(idx, "sparePart", p.name);
                      updateSpare(idx, "sparePartPrice", String(roundSparePrice(p.unitPrice)));
                      updateSpare(idx, "sparePartCount", "1");
                    }}
                  />
                  <div>
                    <Label>Наименование запчасти</Label>
                    <Input
                      value={s.sparePart || ""}
                      onChange={(e) => updateSpare(idx, "sparePart", e.target.value)}
                      placeholder="Введите или выберите запчасть"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Кол-во</Label>
                      <Input value={s.sparePartCount || ""} onChange={(e) => updateSpare(idx, "sparePartCount", e.target.value)} />
                    </div>
                    <div>
                      <Label>Цена за ед. (₸)</Label>
                      <Input value={s.sparePartPrice || ""} onChange={(e) => updateSpare(idx, "sparePartPrice", e.target.value)} />
                    </div>
                    <div>
                      <Label>Итого (₸)</Label>
                      <Input value={String(partSum)} readOnly className="bg-gray-50" />
                    </div>
                  </div>
                  <Button variant="ghost" className="text-red-600" onClick={() => removeSpareRow(idx)}>
                    Удалить запчасть
                  </Button>
                </div>
              );
            })}
            <div ref={sparesEndRef} /> {/* 👈 сюда прокручивает */}
            <Button variant="outline" onClick={addSpareRow}>+ Добавить запчасть</Button>
          </TabsContent>
        </Tabs>

        {/* Общий итог */}
        <div className="mt-6 bg-slate-50 border rounded-md p-4">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-blue-600">Работы: {totals.work.toLocaleString("ru-RU")} ₸</span>
            <span className="text-orange-600">Запчасти: {totals.parts.toLocaleString("ru-RU")} ₸</span>
            <span className="text-green-600">Всего: {totalSum.toLocaleString("ru-RU")} ₸</span>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={saving || !!appNumberError || checkingAppNumber}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
