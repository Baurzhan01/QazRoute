"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [formData, setFormData] = useState<Omit<RouteFormData, 'routeStatus'> & { routeStatus: FrontendRouteStatus }>({
    number: "",
    queue: 0,
    routeStatus: "Будни",
    exitNumbers: "",
  });

  useEffect(() => {
    console.log("route", route)
    if (route) {
      setFormData({
        number: route.number || "",
        queue: route.queue || 0,
        routeStatus: toFrontendStatus(route.routeStatus),
        exitNumbers: route?.busLines?.map((line) => line.number).join(", ") || "",
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
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!route && !formData.exitNumbers) {
      alert("Пожалуйста, укажите номера выходов");
      return;
    }
    console.log("Submitting form data:", formData);
    onSubmit({
      ...formData,
      routeStatus: toBackendStatus(formData.routeStatus),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="number">Номер маршрута</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="queue">Порядок в разнорядке</Label>
            <Input
              id="queue"
              type="number"
              value={formData.queue}
              onChange={(e) => {
                const value = e.target.value;
                const parsed = parseInt(value);
                setFormData({ ...formData, queue: isNaN(parsed) ? formData.queue : parsed });
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="routeStatus">Тип дня</Label>
            <Select
              value={formData.routeStatus}
              onValueChange={(value) =>
                setFormData({ ...formData, routeStatus: value as FrontendRouteStatus })
              }
            >
              <SelectTrigger id="routeStatus">
                <SelectValue placeholder="Выберите тип дня" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Будни">Будни</SelectItem>
                <SelectItem value="Суббота">Суббота</SelectItem>
                <SelectItem value="Воскресенье">Воскресенье</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div>
              <Label htmlFor="exitNumbers">Номера выходов</Label>
              <Input
                id="exitNumbers"
                value={formData.exitNumbers}
                onChange={(e) => setFormData({ ...formData, exitNumbers: e.target.value })}
                placeholder="Например: 1, 2, 3"
                required
              />
            </div>
          <div className="flex justify-end gap-2">
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