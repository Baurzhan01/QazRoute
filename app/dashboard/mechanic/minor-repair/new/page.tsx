"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { busService } from "@/service/busService";
import { sparePartsService } from "@/service/sparePartsService";
import { repairBusService } from "@/service/repairBusService";

import type { BusDepotItem } from "@/types/bus.types";
import type { LaborTime, SparePart } from "@/types/spareParts.types";
import type { CreateRepairRequest } from "@/types/repairBus.types";

// ---------- helpers ----------
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

// ---------- row draft ----------
type RowDraft = {
  busId?: string | null;
  busLabel?: string;

  laborTimeId?: string | null;
  workCode?: string;
  workName?: string;
  workCount?: string;
  workHour?: string;
  workPrice?: string;

  sparePartId?: string | null;
  sparePartArticle?: string;
  sparePartName?: string;
  sparePartCount?: string;
  sparePartPrice?: string;
};

export default function MinorUrgentRepairNewPage() {
  const router = useRouter();

  const [depotId, setDepotId] = useState<string | null>(null);
  const [buses, setBuses] = useState<BusDepotItem[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(false);

  const [applicationNumber, setApplicationNumber] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [departureDateStr, setDepartureDateStr] = useState("");
  const [entryDateStr, setEntryDateStr] = useState("");

  const [rows, setRows] = useState<RowDraft[]>([{}]);
  const [saving, setSaving] = useState(false);

  // диалоги выбора
  const [busDialogRow, setBusDialogRow] = useState<number | null>(null);
  const [busSearch, setBusSearch] = useState("");

  const [workDialogRow, setWorkDialogRow] = useState<number | null>(null);
  const [workSearch, setWorkSearch] = useState("");
  const [workOptions, setWorkOptions] = useState<LaborTime[]>([]);
  const [loadingWork, setLoadingWork] = useState(false);

  const [partDialogRow, setPartDialogRow] = useState<number | null>(null);
  const [partSearch, setPartSearch] = useState("");
  const [partOptions, setPartOptions] = useState<SparePart[]>([]);
  const [loadingPart, setLoadingPart] = useState(false);

  // depotId из authData
  useEffect(() => {
    try {
      const auth = localStorage.getItem("authData");
      if (auth) {
        const u = JSON.parse(auth);
        setDepotId(u?.depotId || u?.busDepotId || null);
      }
    } catch (e) {
      console.error("authData parse error", e);
    }
  }, []);

  // подгружаем автобусы разом
  useEffect(() => {
    (async () => {
      if (!depotId) return;
      setLoadingBuses(true);
      try {
        const res = await busService.getByDepot(depotId, "1", "1000");
        setBuses(res.value?.items ?? []);
      } finally {
        setLoadingBuses(false);
      }
    })();
  }, [depotId]);

  // ---------- helpers ----------
  function updateRow(index: number, patch: Partial<RowDraft>) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, {}]);
  }

  function removeRow(index: number) {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  }

  // ---------- submit ----------
  async function handleSubmit() {
    if (!applicationNumber.trim()) {
      alert("Укажите номер заказ-наряда / заявки");
      return;
    }
    const appNum = Number(applicationNumber.trim());
    if (!Number.isFinite(appNum) || appNum <= 0) {
      alert("Номер заявки должен быть положительным числом");
      return;
    }

    const depDate = departureDateStr || new Date().toISOString().slice(0, 10);
    const entDate = entryDateStr || depDate;
    const reg = (registerNumber || "").trim();

    const payload: CreateRepairRequest[] = rows
      .map((r) => {
        if (!r.busId) return null;

        const workCount = parseDec(r.workCount);
        const workHour = parseDec(r.workHour);
        const workPrice = parseDec(r.workPrice);
        const spareCount = parseDec(r.sparePartCount);
        const sparePrice = parseDec(r.sparePartPrice);

        return {
          busId: r.busId,
          applicationNumber: appNum,
          registerNumber: reg,
          departureDate: depDate,
          entryDate: entDate,

          laborTimeId: r.laborTimeId || null,
          workCount: workCount || 0,
          workHour: workHour || 0,
          workPrice: workPrice || 0,

          sparePartId: r.sparePartId || null,
          sparePartCount: spareCount || 0,
          sparePartPrice: sparePrice || 0,

          minorUrgentRepairs: true,
        } as CreateRepairRequest;
      })
      .filter((x): x is CreateRepairRequest => !!x);

    if (!payload.length) {
      alert("Заполните хотя бы одну строку: выберите автобус и данные ремонта.");
      return;
    }

    setSaving(true);
    try {
      const res = await repairBusService.createBatch(payload);
      if (!res.isSuccess) {
        alert(res.error || "Ошибка при сохранении");
        return;
      }

      // после сохранения — назад на главную механика
      router.push("/dashboard/mechanic");
    } finally {
      setSaving(false);
    }
  }

  // ---------- поиск работ / запчастей ----------
  async function searchWork() {
    if (!workDialogRow && workDialogRow !== 0) return;
    if (!workSearch.trim()) {
      setWorkOptions([]);
      return;
    }
    setLoadingWork(true);
    try {
      const res = await sparePartsService.searchLaborTime(workSearch.trim());
      setWorkOptions(res.isSuccess && res.value ? res.value : []);
    } finally {
      setLoadingWork(false);
    }
  }

  async function searchPart() {
    if (!partDialogRow && partDialogRow !== 0) return;
    if (!partSearch.trim()) {
      setPartOptions([]);
      return;
    }
    setLoadingPart(true);
    try {
      const res = await sparePartsService.searchByArticle(partSearch.trim());
      setPartOptions(res.isSuccess && res.value ? res.value : []);
    } finally {
      setLoadingPart(false);
    }
  }

  // ---------- UI ----------
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">
            Механик / Мелкие / срочные ремонты
          </div>
          <h1 className="text-2xl font-semibold mt-1">
            Новый мелкий / срочный ремонт (batch)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Один номер заказ-наряда — несколько автобусов, работы и запчасти.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Назад
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Сохранение…" : "Сохранить заказ-наряд"}
          </Button>
        </div>
      </div>

      {/* Общие данные */}
      <Card>
        <CardHeader>
          <CardTitle>Общие данные заказ-наряда</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>№ заказ-наряда / заявки *</Label>
              <Input
                value={applicationNumber}
                onChange={(e) =>
                  setApplicationNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Напр. 70012"
              />
            </div>
            <div>
              <Label>№ реестра (опц.)</Label>
              <Input
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="Напр. R-2025-UR-01"
              />
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
        </CardContent>
      </Card>

      {/* Таблица строк */}
      <Card>
        <CardHeader>
          <CardTitle>Строки заказ-наряда</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-xs md:text-sm border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b">
                <th className="px-2 py-2 border-r w-8">№</th>
                <th className="px-2 py-2 border-r w-56">Автобус (гаражный / гос)</th>
                <th className="px-2 py-2 border-r">Работы (код, наименование, кол-во, часы, цена, сумма)</th>
                <th className="px-2 py-2 border-r">Запчасти (артикул, наименование, кол-во, цена, сумма)</th>
                <th className="px-2 py-2 w-8"></th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, idx) => {
                const workSum =
                    parseDec(r.workCount) *
                    parseDec(r.workHour) *
                    parseDec(r.workPrice) || 0;
                const partSum =
                    parseDec(r.sparePartCount) *
                    parseDec(r.sparePartPrice) || 0;

                return (
                    <tr
                    key={idx}
                    className={`border-t ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    } align-top`}
                    >
                    {/* № */}
                    <td className="px-2 py-2 border-r text-center font-medium">
                        {idx + 1}
                    </td>

                    {/* Автобус */}
                    <td className="px-2 py-2 border-r">
                        <div className="flex gap-1">
                        <Input
                            className="h-8"
                            readOnly
                            placeholder="Не выбран"
                            value={r.busLabel || ""}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => setBusDialogRow(idx)}
                        >
                            Найти
                        </Button>
                        </div>
                    </td>

                    {/* Блок РАБОТЫ */}
                    <td className="px-2 py-2 border-r">
                        {/* Код операции */}
                        <div className="flex gap-1 mb-1">
                        <span className="w-16 text-[10px] text-muted-foreground pt-1">
                            Код оп.
                        </span>
                        <Input
                            className="h-8"
                            readOnly
                            placeholder="Не выбран"
                            value={r.workCode || ""}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                            setWorkDialogRow(idx);
                            setWorkSearch("");
                            setWorkOptions([]);
                            }}
                        >
                            Найти
                        </Button>
                        </div>

                        {/* Наименование работы */}
                        <div className="flex gap-1 mb-1">
                        <span className="w-16 text-[10px] text-muted-foreground pt-1">
                            Работа
                        </span>
                        <Input
                            className="h-8"
                            value={r.workName || ""}
                            onChange={(e) =>
                            updateRow(idx, { workName: e.target.value })
                            }
                            placeholder="Наименование работы"
                        />
                        </div>

                        {/* Кол-во / Часы / Цена / Сумма */}
                        <div className="grid grid-cols-4 gap-1 mt-1">
                        <div>
                            <div className="text-[9px] text-muted-foreground">
                            Кол-во
                            </div>
                            <Input
                            className="h-8"
                            value={r.workCount || ""}
                            onChange={(e) =>
                                updateRow(idx, { workCount: e.target.value })
                            }
                            />
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground">
                            Часы
                            </div>
                            <Input
                            className="h-8"
                            value={r.workHour || ""}
                            onChange={(e) =>
                                updateRow(idx, { workHour: e.target.value })
                            }
                            />
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground">
                            Цена (₸)
                            </div>
                            <Input
                            className="h-8"
                            value={r.workPrice || ""}
                            onChange={(e) =>
                                updateRow(idx, { workPrice: e.target.value })
                            }
                            />
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground">
                            Сумма (₸)
                            </div>
                            <Input
                            className="h-8 bg-gray-50"
                            readOnly
                            value={workSum ? String(workSum) : ""}
                            />
                        </div>
                        </div>
                    </td>

                    {/* Блок ЗАПЧАСТИ */}
                    <td className="px-2 py-2 border-r">
                        {/* Артикул / выбор */}
                        <div className="flex gap-1 mb-1">
                        <span className="w-16 text-[10px] text-muted-foreground pt-1">
                            Артикул
                        </span>
                        <Input
                            className="h-8"
                            readOnly
                            placeholder="Не выбрана"
                            value={
                            r.sparePartArticle
                                ? `${r.sparePartArticle} ${r.sparePartName || ""}`
                                : ""
                            }
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                            setPartDialogRow(idx);
                            setPartSearch("");
                            setPartOptions([]);
                            }}
                        >
                            Найти
                        </Button>
                        </div>

                        {/* Кол-во / Цена / Сумма */}
                        <div className="grid grid-cols-3 gap-1 mt-1">
                        <div>
                            <div className="text-[9px] text-muted-foreground">
                            Кол-во
                            </div>
                            <Input
                            className="h-8"
                            value={r.sparePartCount || ""}
                            onChange={(e) =>
                                updateRow(idx, {
                                sparePartCount: e.target.value,
                                })
                            }
                            />
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground">
                            Цена (₸)
                            </div>
                            <Input
                            className="h-8"
                            value={r.sparePartPrice || ""}
                            onChange={(e) =>
                                updateRow(idx, {
                                sparePartPrice: e.target.value,
                                })
                            }
                            />
                        </div>
                        <div>
                            <div className="text-[9px] text-muted-foreground">
                            Сумма (₸)
                            </div>
                            <Input
                            className="h-8 bg-gray-50"
                            readOnly
                            value={partSum ? String(partSum) : ""}
                            />
                        </div>
                        </div>
                    </td>

                    {/* Удалить строку */}
                    <td className="px-1 py-2 text-center align-top">
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => removeRow(idx)}
                        >
                        ✕
                        </Button>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
          </div>

          <Button variant="outline" onClick={addRow}>
            + Добавить строку
          </Button>
        </CardContent>
      </Card>

      {/* ---------- Диалог выбора автобуса ---------- */}
      <Dialog
        open={busDialogRow !== null}
        onOpenChange={(open) => !open && setBusDialogRow(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Выбор автобуса</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Поиск по гаражному или гос. номеру"
              value={busSearch}
              onChange={(e) => setBusSearch(e.target.value)}
            />
            <div className="max-h-72 overflow-y-auto border rounded-md divide-y">
              {(buses || [])
                .filter((b) => {
                  if (!busSearch.trim()) return true;
                  const q = busSearch.toLowerCase();
                  return (
                    (b.garageNumber || "").toLowerCase().includes(q) ||
                    (b.govNumber || "").toLowerCase().includes(q)
                  );
                })
                .map((b) => (
                  <button
                    key={b.id}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm"
                    onClick={() => {
                      if (busDialogRow === null) return;
                      updateRow(busDialogRow, {
                        busId: b.id,
                        busLabel: `${b.garageNumber || "—"} / ${
                          b.govNumber || "—"
                        }`,
                      });
                      setBusDialogRow(null);
                    }}
                  >
                    <div className="font-medium">
                      {b.garageNumber || "—"} / {b.govNumber || "—"}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {b.brand || "—"} {b.type || ""}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Диалог выбора работы ---------- */}
      <Dialog
        open={workDialogRow !== null}
        onOpenChange={(open) => !open && setWorkDialogRow(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Выбор операции</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Код или наименование операции"
                value={workSearch}
                onChange={(e) => setWorkSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchWork()}
              />
              <Button onClick={searchWork} disabled={loadingWork}>
                Найти
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto border rounded-md divide-y text-sm">
              {loadingWork && (
                <div className="px-3 py-2 text-muted-foreground">
                  Поиск...
                </div>
              )}
              {!loadingWork &&
                workOptions.map((l) => (
                  <button
                    key={l.id}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100"
                    onClick={() => {
                        if (workDialogRow === null) return;
                      
                        updateRow(workDialogRow, {
                          laborTimeId: l.id,
                          workCode: l.operationCode,
                          workName: l.operationName,
                          workCount: l.quantity
                            ? String(l.quantity)
                            : (rows[workDialogRow].workCount || "1"),
                          workHour: l.hours
                            ? String(l.hours)
                            : (rows[workDialogRow].workHour || "0"),
                          workPrice:
                            l.price != null
                              ? String(l.price)
                              : (rows[workDialogRow].workPrice || "0"),
                        });
                      
                        setWorkDialogRow(null);
                      }}                      
                  >
                    <div className="font-medium">
                      {l.operationCode} — {l.operationName}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {l.busModel}
                    </div>
                  </button>
                ))}
              {!loadingWork && workOptions.length === 0 && (
                <div className="px-3 py-2 text-muted-foreground">
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Диалог выбора запчасти ---------- */}
      <Dialog
        open={partDialogRow !== null}
        onOpenChange={(open) => !open && setPartDialogRow(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Выбор запчасти</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Артикул или наименование"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPart()}
              />
              <Button onClick={searchPart} disabled={loadingPart}>
                Найти
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto border rounded-md divide-y text-sm">
              {loadingPart && (
                <div className="px-3 py-2 text-muted-foreground">
                  Поиск...
                </div>
              )}
              {!loadingPart &&
                partOptions.map((p) => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100"
                    onClick={() => {
                      if (partDialogRow === null) return;
                      updateRow(partDialogRow, {
                        sparePartId: p.id,
                        sparePartArticle: p.article,
                        sparePartName: p.name,
                        sparePartPrice: String(
                          roundSparePrice(p.unitPrice)
                        ),
                        sparePartCount:
                          rows[partDialogRow].sparePartCount || "1",
                      });
                      setPartDialogRow(null);
                    }}
                  >
                    <div className="font-medium">
                      {p.article} — {p.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {p.busModel} ·{" "}
                      {roundSparePrice(p.unitPrice)} ₸
                    </div>
                  </button>
                ))}
              {!loadingPart && partOptions.length === 0 && (
                <div className="px-3 py-2 text-muted-foreground">
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
