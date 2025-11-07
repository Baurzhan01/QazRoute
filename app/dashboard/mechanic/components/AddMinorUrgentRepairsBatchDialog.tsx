"use client";

import { useEffect, useState } from "react";
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
import { busService } from "@/service/busService";
import { sparePartsService } from "@/service/sparePartsService";

import type { CreateRepairRequest, Repair } from "@/types/repairBus.types";
import type { BusDepotItem } from "@/types/bus.types";
import type { LaborTime, SparePart } from "@/types/spareParts.types";

import SearchInput from "./SearchInput";

// --- helpers ---
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

// --- row draft ---
type RowDraft = {
  busId?: string | null;
  busLabel?: string; // для отображения (гаражный + гос)

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

interface Props {
  trigger?: React.ReactNode;
  onCreated?: (created: Repair[]) => void;
}

/**
 * Диалог: создание МЕЛКИХ / СРОЧНЫХ ремонтов под одним № заказ-наряда
 * minorUrgentRepairs всегда = true
 */
export default function AddMinorUrgentRepairsBatchDialog({
  trigger,
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);

  // глобальные поля для одного заказ-наряда
  const [applicationNumber, setApplicationNumber] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [departureDateStr, setDepartureDateStr] = useState("");
  const [entryDateStr, setEntryDateStr] = useState("");

  const [depotId, setDepotId] = useState<string | null>(null);
  const [buses, setBuses] = useState<BusDepotItem[]>([]);

  const [rows, setRows] = useState<RowDraft[]>([{ }]);
  const [saving, setSaving] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);

  // вытаскиваем depotId из authData
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

  // подгружаем список автобусов для выпадающего поиска
  useEffect(() => {
    (async () => {
      if (!depotId) return;
      setLoadingBuses(true);
      try {
        const res = await busService.getByDepot(
          depotId,
          "1",
          "500" // берем побольше для поиска
        );
        setBuses(res.value?.items ?? []);
      } finally {
        setLoadingBuses(false);
      }
    })();
  }, [depotId]);

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

  async function submit() {
    if (!applicationNumber.trim()) {
      alert("Укажите номер заказ-наряда / заявки");
      return;
    }

    const appNum = Number(applicationNumber.trim());
    if (!Number.isFinite(appNum) || appNum <= 0) {
      alert("Номер заявки должен быть положительным числом");
      return;
    }

    const depDate =
      departureDateStr || new Date().toISOString().slice(0, 10);
    const entDate = entryDateStr || depDate;
    const reg = (registerNumber || "").trim();

    // собираем payload: по одной записи на каждую строку (bus + работа + запчасть)
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

          // работа
          laborTimeId: r.laborTimeId || null,
          workCount: workCount || 0,
          workHour: workHour || 0,
          workPrice: workPrice || 0,

          // запчасть
          sparePartId: r.sparePartId || null,
          sparePartCount: spareCount || 0,
          sparePartPrice: sparePrice || 0,

          // флаг срочного/мелкого ремонта
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
      if (res.isSuccess) {
        onCreated?.(res.value ?? []);
        setOpen(false);
        // сброс формы
        setApplicationNumber("");
        setRegisterNumber("");
        setDepartureDateStr("");
        setEntryDateStr("");
        setRows([{}]);
      } else {
        alert(res.error || "Ошибка при сохранении");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            ⚡ Мелкий / срочный ремонт (несколько автобусов)
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            Мелкие / срочные ремонты (один № заказ-наряда — несколько автобусов)
          </DialogTitle>
        </DialogHeader>

        {/* Верхние общие поля */}
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <div>
            <Label>№ заказ-наряда / заявки *</Label>
            <Input
              value={applicationNumber}
              onChange={(e) =>
                setApplicationNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Напр. 700123"
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

        {/* Таблица строк */}
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-2 py-2 border-r w-10">№</th>
                <th className="px-2 py-2 border-r w-52">Автобус<br/>гаражный / гос</th>
                <th className="px-2 py-2 border-r w-32">Код оп.</th>
                <th className="px-2 py-2 border-r">Наименование работы</th>
                <th className="px-2 py-2 border-r w-16">Кол-во</th>
                <th className="px-2 py-2 border-r w-16">Часы</th>
                <th className="px-2 py-2 border-r w-24">Цена (₸)</th>
                <th className="px-2 py-2 border-r w-32">Сумма (₸)</th>
                <th className="px-2 py-2 border-r w-40">Запчасть / артикул</th>
                <th className="px-2 py-2 border-r w-20">Кол-во</th>
                <th className="px-2 py-2 border-r w-24">Цена (₸)</th>
                <th className="px-2 py-2 w-32">Сумма (₸)</th>
                <th className="px-2 py-2 w-14"></th>
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
                    }`}
                  >
                    {/* № */}
                    <td className="px-2 py-2 border-r text-center font-medium">
                      {idx + 1}
                    </td>

                    {/* Автобус: поиск по гаражному / гос */}
                    <td className="px-2 py-1 border-r min-w-[180px]">
                        <SearchInput<BusDepotItem>
                            label=""
                            placeholder={
                            loadingBuses
                                ? "Загрузка автобусов..."
                                : "Гаражный или гос. номер"
                            }
                            value={r.busLabel || ""}
                            fetchOptions={async (q) => {
                            if (!depotId) return [];
                            const qLower = q.toLowerCase();
                            // фильтрация по уже загруженным автобусам
                            return buses.filter((b) => {
                                const g = (b.garageNumber || "").toLowerCase();
                                const gv = (b.govNumber || "").toLowerCase();
                                return g.includes(qLower) || gv.includes(qLower);
                            });
                            }}
                            onChange={(val) =>
                            updateRow(idx, { busLabel: val })
                            }
                            renderOption={(b) => (
                            <div>
                                <div className="font-medium">
                                {b.garageNumber || "—"} / {b.govNumber || "—"}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                {b.brand || "—"} {b.type || ""}
                                </div>
                            </div>
                            )}
                            onSelect={(b) =>
                            updateRow(idx, {
                                busId: b.id,
                                busLabel: `${b.garageNumber || "—"} / ${
                                b.govNumber || "—"
                                }`,
                            })
                            }
                        />
                        </td>
                    {/* Код операции с поиском */}
                    <td className="px-2 py-1 border-r">
                      <SearchInput<LaborTime>
                        label=""
                        placeholder="Код"
                        value={r.workCode || ""}
                        onChange={(val) =>
                          updateRow(idx, { workCode: val })
                        }
                        fetchOptions={async (q) => {
                          const res =
                            await sparePartsService.searchLaborTime(q);
                          return res.isSuccess && res.value
                            ? res.value
                            : [];
                        }}
                        renderOption={(l) => (
                          <div>
                            <div className="font-medium">
                              {l.operationCode} — {l.operationName}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {l.busModel}
                            </div>
                          </div>
                        )}
                        onSelect={(l) =>
                          updateRow(idx, {
                            laborTimeId: l.id,
                            workCode: l.operationCode,
                            workName: l.operationName,
                            workCount: l.quantity
                              ? String(l.quantity)
                              : "1",
                            workHour: l.hours
                              ? String(l.hours)
                              : "0",
                            workPrice: r.workPrice || "0",
                          })
                        }
                      />
                    </td>

                    {/* Наименование работы */}
                    <td className="px-2 py-1 border-r">
                      <Input
                        className="h-8"
                        value={r.workName || ""}
                        onChange={(e) =>
                          updateRow(idx, {
                            workName: e.target.value,
                          })
                        }
                        placeholder="Наименование работы"
                      />
                    </td>

                    {/* Кол-во */}
                    <td className="px-1 py-1 border-r">
                      <Input
                        className="h-8"
                        value={r.workCount || ""}
                        onChange={(e) =>
                          updateRow(idx, {
                            workCount: e.target.value,
                          })
                        }
                      />
                    </td>

                    {/* Часы */}
                    <td className="px-1 py-1 border-r">
                      <Input
                        className="h-8"
                        value={r.workHour || ""}
                        onChange={(e) =>
                          updateRow(idx, {
                            workHour: e.target.value,
                          })
                        }
                      />
                    </td>

                    {/* Цена работы */}
                    <td className="px-1 py-1 border-r">
                      <Input
                        className="h-8"
                        value={r.workPrice || ""}
                        onChange={(e) =>
                          updateRow(idx, {
                            workPrice: e.target.value,
                          })
                        }
                      />
                    </td>

                    {/* Сумма работы */}
                    <td className="px-1 py-1 border-r">
                      <Input
                        className="h-8 bg-gray-50"
                        readOnly
                        value={workSum ? String(workSum) : ""}
                      />
                    </td>

                    {/* Запчасть / артикул */}
                    <td className="px-2 py-1 border-r">
                      <SearchInput<SparePart>
                        label=""
                        placeholder="Артикул / запчасть"
                        value={r.sparePartArticle || ""}
                        onChange={(val) =>
                          updateRow(idx, {
                            sparePartArticle: val,
                          })
                        }
                        fetchOptions={async (q) => {
                          const res =
                            await sparePartsService.searchByArticle(q);
                          return res.isSuccess && res.value
                            ? res.value
                            : [];
                        }}
                        renderOption={(p) => (
                          <div>
                            <div className="font-medium">
                              {p.article} — {p.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {p.busModel} ·{" "}
                              {roundSparePrice(
                                p.unitPrice
                              )}{" "}
                              ₸
                            </div>
                          </div>
                        )}
                        onSelect={(p) =>
                          updateRow(idx, {
                            sparePartId: p.id,
                            sparePartArticle: p.article,
                            sparePartName: p.name,
                            sparePartPrice: String(
                              roundSparePrice(p.unitPrice)
                            ),
                            sparePartCount:
                              r.sparePartCount || "1",
                          })
                        }
                      />
                    </td>

                    {/* Кол-во запчастей */}
                    <td className="px-1 py-1 border-r">
                      <Input
                        className="h-8"
                        value={r.sparePartCount || ""}
                        onChange={(e) =>
                          updateRow(idx, {
                            sparePartCount: e.target.value,
                          })
                        }
                      />
                    </td>

                    {/* Цена запчасти */}
                    <td className="px-1 py-1 border-r">
                      <Input
                        className="h-8"
                        value={r.sparePartPrice || ""}
                        onChange={(e) =>
                          updateRow(idx, {
                            sparePartPrice: e.target.value,
                          })
                        }
                      />
                    </td>

                    {/* Сумма запчастей */}
                    <td className="px-1 py-1">
                      <Input
                        className="h-8 bg-gray-50"
                        readOnly
                        value={partSum ? String(partSum) : ""}
                      />
                    </td>

                    {/* Удалить строку */}
                    <td className="px-1 py-1 text-center align-middle">
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

        {/* Кнопка добавить строку */}
        <div className="mt-3">
          <Button variant="outline" onClick={addRow}>
            + Добавить строку
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить заказ-наряд"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
