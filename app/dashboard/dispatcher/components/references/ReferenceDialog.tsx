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
import { releasePlanService } from "@/service/releasePlanService";
import { actionLogService } from "@/service/actionLogService";
import { statementsService } from "@/service/statementsService";
import { useConvoy } from "../../context/ConvoyContext";
import type { StatementStatus } from "@/types/statement.types";
import { formatDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils";
import type { ReferenceType } from "@/types/reference.types";
import type { RouteAssignment } from "@/types/releasePlanTypes";

interface ReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: RouteAssignment | null;         // текущая строка
  displayDate: Date;                          // ⬅️ добавили дату, чтобы апдейтить описание
  onCreated?: (referenceId: string, textForDescription: string) => void; // ⬅️ вернём текст наверх
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

const REF_LABEL: Record<ReferenceType, string> = {
  FamilyReason: "По семейным обстоятельствам",
  SickByCall: "Болезнь по звонку (утром)",
  PoliceCallBeforeDeparture: "102 (до выезда на линию)",
  GasStationIssue: "АЗС (пробки/колонка)",
  PoliceOperation: "ОПМ (проверка ГАИ)",
  AccidentInDepot: "ДТП в парке",
  DriverLate: "Опоздание водителя",
  TechnicalIssue: "Техническая неисправность",
  AlcoholIntoxication: "Алкогольная интоксикация",
  NoCharge: "Нет зарядки",
  EmergencyInDepot: "ЧС в парке",
  Other: "Другое",
};

export default function ReferenceDialog({
  open,
  onOpenChange,
  assignment,
  displayDate,
  onCreated,
}: ReferenceDialogProps) {
  const [type, setType] = useState<ReferenceType | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // описание доступно для Other (обязательно) и TechnicalIssue (опционально)
  const canDescribe = type === "Other" || type === "TechnicalIssue";
  const mustDescribe = type === "Other";
  const isValid = !!assignment && !!type && (!mustDescribe || description.trim().length > 0);
  const { convoyId } = useConvoy();

  const info = useMemo(() => {
    if (!assignment) return null;
    return {
      routeNumber: (assignment as any).routeNumber, // мы пробрасываем в модалку из таблицы
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

  const buildDescriptionText = (t: ReferenceType, desc: string) => {
    const base = `🧾 Справка: ${REF_LABEL[t]}`;
    const extra =
      t === "Other"
        ? (desc?.trim() ? `. ${desc.trim()}` : "")
        : t === "TechnicalIssue"
        ? (desc?.trim() ? `. ${desc.trim()}` : "")
        : "";
    return `${base}${extra}`;
  };

  const handleSubmit = async () => {
    if (!assignment || !type) return;

    try {
      setLoading(true);

      // 1) создаём справку
      const res = await referenceService.create({
        dispatchBusLineId: assignment.dispatchBusLineId,
        type: type as ReferenceType,
        description: canDescribe ? description.trim() : "",
      });
      if (!res.isSuccess) throw new Error(res.error || "Не удалось создать справку");

      // 2) формируем текст и обновляем описание релиза (одно обращение к /dispatches/update-description)
      const textForDescription = buildDescriptionText(type as ReferenceType, description);
      await releasePlanService.updateBusLineDescription(
        assignment.dispatchBusLineId,
        formatDate(displayDate),
        textForDescription
      );

      // 2.5) Добавим запись в ActionLog с деталями справки
      try {
        // Разрешим statementId через helper
        let statementId = convoyId
          ? await releasePlanService.findStatementIdByDispatch(
              formatDate(displayDate),
              convoyId,
              assignment.dispatchBusLineId
            )
          : null;

        // Fallback: if statement not found by bus line, try by convoy+date
        if (!statementId && convoyId) {
          try {
            const list = await statementsService.getByConvoyAndDate(convoyId, formatDate(displayDate))
            statementId = list.value?.[0]?.id ?? null
          } catch {}
        }

        if (statementId) {
          const now = new Date();
          const pad = (n: number) => n.toString().padStart(2, "0");
          const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

          const driverInfo = assignment.driver?.serviceNumber
            ? `таб. №${assignment.driver.serviceNumber}`
            : "таб. № —";
          const busInfo = assignment.garageNumber
            ? `автобус ${assignment.garageNumber}`
            : assignment.bus?.garageNumber
            ? `автобус ${assignment.bus.garageNumber}`
            : "автобус —";

          const details = description?.trim() ? `. ${description.trim()}` : "";
          const logDescription = `Справка: ${REF_LABEL[type as ReferenceType]}. ${driverInfo}, ${busInfo}${details}`;

          const statementStatus: StatementStatus = "OnWork";

          await actionLogService.create({
            statementId,
            time,
            driverId: assignment.driver?.id ?? null,
            busId: assignment.bus?.id ?? null,
            revolutionCount: 0,
            description: logDescription,
            statementStatus,
            actionStatus: String(type),
          });
        }
      } catch (e) {
        console.warn("action log create failed for reference", e);
      }

      // 3) шлём событие — пусть слушатели обновятся (если подписаны)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("reference:created", {
            detail: {
              dispatchBusLineId: assignment.dispatchBusLineId,
              referenceId: res.value,
              type,
              description: canDescribe ? description.trim() : "",
              textForDescription,
            },
          })
        );
      }

      toast({ title: "Справка создана", description: "Запись сохранена и добавлена в доп. информацию." });

      // 4) сообщаем родителю текст, чтобы обновить строку локально без лишних запросов
      onCreated?.(res.value, textForDescription);

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

  const placeholder =
    type === "Other"
      ? "Укажите причину"
      : type === "TechnicalIssue"
      ? "Опишите неисправность (по желанию)"
      : "Недоступно для выбранного типа";

  const hint =
    type === "Other"
      ? "Обязательно для «Другое»"
      : type === "TechnicalIssue"
      ? "Можно дополнительно описать неисправность"
      : "Недоступно для выбранного типа";

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : handleClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Справка по выходу</DialogTitle>
          <DialogDescription>Заполните причину по текущему выходу (DispatchBusLine)</DialogDescription>
        </DialogHeader>

        {/* Шапка */}
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

        {/* Тип */}
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

        {/* Описание */}
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
            {canDescribe ? `${description.trim().length} символов. ${hint}` : hint}
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
