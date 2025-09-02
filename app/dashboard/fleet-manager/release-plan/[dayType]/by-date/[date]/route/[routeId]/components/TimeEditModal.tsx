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
import { busLineService } from "@/service/busLineService";

interface TimeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  busLineId: string;
  busLineNumber: string;
  routeId: string;
  timeType: "exitTime" | "endTime" | "shiftChangeTime";
  onSuccess?: () => void;
}

export default function TimeEditModal({
  isOpen,
  onClose,
  busLineId,
  busLineNumber,
  routeId,
  timeType,
  onSuccess,
}: TimeEditModalProps) {
  const [value, setValue] = useState("08:00");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [times, setTimes] = useState<{
    exitTime: string;
    endTime: string;
    shiftChangeTime: string;
  }>({ exitTime: "00:00", endTime: "00:00", shiftChangeTime: "00:00" });

  useEffect(() => {
    const loadBusLine = async () => {
      if (!isOpen || !busLineId) return;

      setLoading(true);
      try {
        const res = await busLineService.getById(busLineId);
        if (res.isSuccess && res.value) {
          const { exitTime, endTime, shiftChangeTime } = res.value;
          setTimes({
            exitTime: (exitTime ?? "00:00").substring(0, 5),
            endTime: (endTime ?? "00:00").substring(0, 5),
            shiftChangeTime: (shiftChangeTime ?? "00:00").substring(0, 5),
          });

          const defaultTime = res.value[timeType] ?? "00:00";
          setValue(defaultTime.substring(0, 5));
        } else {
          setError("Не удалось загрузить данные выхода");
        }
      } catch (err) {
        setError("Ошибка при загрузке выхода");
      } finally {
        setLoading(false);
      }
    };

    loadBusLine();
  }, [isOpen, busLineId, timeType]);

  const formatTime = (str: string): string => {
    if (!/^\d{2}:\d{2}$/.test(str)) return "00:00:00";
    return `${str}:00`;
  };

  const handleSave = async () => {
    if (!/^\d{2}:\d{2}$/.test(value)) {
      setError("Введите время в формате ЧЧ:ММ");
      return;
    }

    try {
      const updatedTime = value + ":00";

      const body = {
        number: busLineNumber,
        routeId,
        exitTime: timeType === "exitTime" ? updatedTime : formatTime(times.exitTime),
        endTime: timeType === "endTime" ? updatedTime : formatTime(times.endTime),
        shiftChangeTime:
          timeType === "shiftChangeTime"
            ? updatedTime
            : formatTime(times.shiftChangeTime),
      };

      console.log("TimeEditModal - обновляем время:", {
        timeType,
        value,
        updatedTime,
        body
      });

      const res = await busLineService.update(busLineId, body);

      console.log("TimeEditModal - результат обновления:", res);

      if (res.isSuccess) {
        onClose();
        onSuccess?.();
      } else {
        setError("Ошибка при сохранении: " + res.error);
      }
    } catch (err) {
      console.error("TimeEditModal - ошибка:", err);
      setError("Ошибка запроса: " + String(err));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить {getLabel(timeType)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Введите новое время в формате <b>ЧЧ:ММ</b>
          </p>

          <Input
            value={value}
            onChange={(e) => {
              let raw = e.target.value.replace(/\D/g, "");
              if (raw.length > 4) raw = raw.slice(0, 4);
              if (raw.length >= 3) {
                raw = raw.slice(0, 2) + ":" + raw.slice(2);
              }
              setValue(raw);
            }}
            placeholder="08:00"
            maxLength={5}
            disabled={loading}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getLabel(type: "exitTime" | "endTime" | "shiftChangeTime") {
  switch (type) {
    case "exitTime":
      return "время выхода";
    case "endTime":
      return "время окончания";
    case "shiftChangeTime":
      return "время пересменки";
    default:
      return "время";
  }
}
