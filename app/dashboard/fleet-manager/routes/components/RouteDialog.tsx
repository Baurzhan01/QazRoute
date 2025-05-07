"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import type { Route, RouteFormData } from "../types";
import { toBackendStatus, toFrontendStatus, type FrontendRouteStatus } from "../utils/routeStatusUtils";

interface RouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  route?: Route;
  onSubmit: (formData: RouteFormData) => void;
}

export default function RouteDialog({
  open,
  onOpenChange,
  title,
  route,
  onSubmit,
}: RouteDialogProps) {
  const [formData, setFormData] = useState<Omit<RouteFormData, "routeStatus"> & { routeStatus: FrontendRouteStatus }>({
    number: "",
    queue: 0,
    routeStatus: "Будни",
    exitNumbers: "",
  });

  useEffect(() => {
    if (route) {
      setFormData({
        number: route.number || "",
        queue: route.queue || 0,
        routeStatus: toFrontendStatus(route.routeStatus),
        exitNumbers: route.busLines?.map((line) => line.number).join(", ") || "",
      });
    } else {
      setFormData({
        number: "",
        queue: 0,
        routeStatus: "Будни",
        exitNumbers: "",
      });
    }
  }, [route]);

  // Очистка данных только перед отправкой (удаляем пробелы, дублирующиеся номера)
  const cleanExitNumbers = (input: string) => {
    return Array.from(new Set(input.split(",").map((n) => n.trim()).filter(Boolean))).join(", ");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.number.trim()) {
      toast({ title: "Ошибка", description: "Введите номер маршрута", variant: "destructive" });
      return;
    }
    if (formData.queue <= 0) {
      toast({ title: "Ошибка", description: "Порядок должен быть больше 0", variant: "destructive" });
      return;
    }
    if (!formData.exitNumbers.trim()) {
      toast({ title: "Ошибка", description: "Укажите хотя бы один выход", variant: "destructive" });
      return;
    }

    const preparedData: RouteFormData = {
      number: formData.number,
      queue: formData.queue,
      exitNumbers: cleanExitNumbers(formData.exitNumbers),
      routeStatus: toBackendStatus(formData.routeStatus),
    };

    onSubmit(preparedData);
  };

  // Для бейджиков просто разделяем строки (не чистим!)
  const parsedExits = formData.exitNumbers
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="number">Номер маршрута</Label>
            <Input
              id="number"
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="Например: 105"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="queue">Порядок в разнорядке</Label>
            <Input
              id="queue"
              type="number"
              value={formData.queue}
              onChange={(e) => {
                const parsed = parseInt(e.target.value);
                if (!isNaN(parsed)) {
                  setFormData({ ...formData, queue: parsed });
                } else {
                  setFormData({ ...formData, queue: 0 });
                }
              }}
              placeholder="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routeStatus">Тип дня</Label>
            <Select
              value={formData.routeStatus}
              onValueChange={(value) => setFormData({ ...formData, routeStatus: value as FrontendRouteStatus })}
            >
              <SelectTrigger id="routeStatus">
                <SelectValue placeholder="Выберите день" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Будни">Будни</SelectItem>
                <SelectItem value="Суббота">Суббота</SelectItem>
                <SelectItem value="Воскресенье">Воскресенье</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exitNumbers">Номера выходов</Label>
            <Input
              id="exitNumbers"
              type="text"
              inputMode="text"   // <<< ВАЖНО: это убирает ограничения на ввод
              value={formData.exitNumbers}
              onChange={(e) => setFormData({ ...formData, exitNumbers: e.target.value })}
              placeholder="Например: 1, 2, 3"
              required
            />
            {parsedExits.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {parsedExits.map((exit, idx) => (
                  <Badge key={idx} variant="outline">
                    № {exit}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">{route ? "Сохранить" : "Добавить"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
