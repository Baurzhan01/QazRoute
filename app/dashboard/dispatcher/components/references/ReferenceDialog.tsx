// components/references/ReferenceDialog.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { referenceService } from "@/service/referenceService";
import type { ReferenceType } from "@/types/reference.types";
import type { RouteAssignment } from "@/types/releasePlanTypes";

interface ReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: RouteAssignment | null;
  onCreated?: (referenceId: string) => void;
}

const OPTIONS: { value: ReferenceType; label: string }[] = [
  { value: "FamilyReason", label: "По семейным обстоятельствам" },
  { value: "SickByCall", label: "Болезнь по звонку (утром)" },
  { value: "PoliceCallBeforeDeparture", label: "102 (до выезда на линию)" },
  { value: "GasStationIssue", label: "АЗС (пробки, колонка не работает)" },
  { value: "PoliceOperation", label: "ОПМ (проверка ГАИ)" },
  { value: "AccidentInDepot", label: "ДТП на территории парка" },
  { value: "DriverLate", label: "Опоздание водителя" },
  { value: "TechnicalIssue", label: "Техническая неисправность" },
  { value: "AlcoholIntoxication", label: "Алкогольная интоксикация" },
  { value: "NoCharge", label: "Нет зарядки" },
  { value: "EmergencyInDepot", label: "ЧС (травма на территории)" },
  { value: "Other", label: "Другое (указать причину)" },
];

export default function ReferenceDialog({
  open,
  onOpenChange,
  assignment,
  onCreated,
}: ReferenceDialogProps) {
  const [type, setType] = useState<ReferenceType | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 Описание доступно для Other И TechnicalIssue
  const canDescribe = type === "Other" || type === "TechnicalIssue";
  // 👇 Обязательное только для Other
  const mustDescribe = type === "Other";
  const isValid = !!assignment && !!type && (!mustDescribe || description.trim().length > 0);

  const info = useMemo(() => {
    if (!assignment) return null;
    return {
      routeNumber: assignment.routeNumber,
      busLineNumber: assignment.busLineNumber,
      garageNumber: assignment.garageNumber ?? assignment.bus?.garageNumber ?? "—",
      stateNumber: assignment.stateNumber ?? assignment.bus?.govNumber ?? "—",
      driverName: assignment.driver?.fullName ?? "—",
      driverService: assignment.driver?.serviceNumber ?? "—",
    };
  }, [assignment]);

  const handleClose = () => {
    setType("");
    setDescription("");
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    try {
      setLoading(true);
      const body = {
        dispatchBusLineId: assignment.dispatchBusLineId,
        type: type as ReferenceType,
        // Для Other — обязательно, для TechnicalIssue — опционально, для остальных — пусто
        description: canDescribe ? description.trim() : "",
      };
      const res = await referenceService.create(body);
      if (!res.isSuccess) throw new Error(res.error || "Не удалось создать справку");

      // Событие для мгновенного обновления AssignmentCell и хука useConvoyReleasePlan
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("reference:created", {
            detail: {
              dispatchBusLineId: assignment.dispatchBusLineId,
              referenceId: res.value,
              type,
              description: canDescribe ? description.trim() : "",
            },
          })
        );
      }

      toast({ title: "Справка создана", description: "Запись успешно сохранена." });
      onCreated?.(res.value);
      handleClose();
    } catch (e: any) {
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось создать справку",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelHelp =
    type === "Other"
      ? "Обязательно заполнить для «Другое»"
      : type === "TechnicalIssue"
      ? "Можно дополнительно описать неисправность (необязательно)"
      : "Недоступно для выбранного типа";

  const placeholder =
    type === "Other"
      ? "Укажите причину"
      : type === "TechnicalIssue"
      ? "Опишите неисправность (при желании)"
      : "Недоступно для выбранного типа";

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : handleClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Справка по выходу</DialogTitle>
          <DialogDescription>
            Заполните причину по текущему выходу (DispatchBusLine)
          </DialogDescription>
        </DialogHeader>

        {/* Шапка с данными текущего выхода/водителя */}
        <div className="rounded-md border p-3 bg-gray-50 space-y-1">
          <div className="text-sm">
            <span className="text-gray-500">Маршрут: </span>
            <span className="font-medium">{info?.routeNumber ?? "—"}</span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">Выход: </span>
            <span className="font-medium">{info?.busLineNumber ?? "—"}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Автобус: </span>
            <span className="font-medium">
              {info?.garageNumber} ({info?.stateNumber})
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Водитель: </span>
            <span className="font-medium">
              {info?.driverName} — таб. № {info?.driverService}
            </span>
          </div>
        </div>

        {/* Выбор типа */}
        <div className="grid gap-2">
          <Label>Тип справки</Label>
          <Select value={type} onValueChange={(v) => setType(v as ReferenceType)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              {OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Описание — доступно для Other (обязательно) и TechnicalIssue (опционально) */}
        <div className="grid gap-2">
          <Label htmlFor="ref-desc">
            Описание {type === "Other" ? "(обязательно)" : type === "TechnicalIssue" ? "(по желанию)" : "(недоступно)"}
          </Label>
          <Textarea
            id="ref-desc"
            placeholder={placeholder}
            disabled={!canDescribe}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={!canDescribe ? "opacity-60 cursor-not-allowed" : ""}
          />
          <div className="text-xs text-gray-500">
            {canDescribe ? `${description.trim().length} символов. ${labelHelp}` : labelHelp}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
