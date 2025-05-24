"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Button
} from "@/components/ui/button";
import {
  Input
} from "@/components/ui/input";
import {
  Label
} from "@/components/ui/label";
import {
  Badge
} from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import type { Route, RouteFormData } from "../types";
import { toBackendStatus, toFrontendStatus, type FrontendRouteStatus } from "../utils/routeStatusUtils";
import { routeService } from "@/service/routeService";

// ⏳ Debounce хук
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

interface RouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  route?: Route;
  onSubmit: (formData: RouteFormData) => void;
}

export default function RouteDialog({
  open, onOpenChange, title, route, onSubmit,
}: RouteDialogProps) {
  const [formData, setFormData] = useState<Omit<RouteFormData, "routeStatus"> & { routeStatus: FrontendRouteStatus }>({
    number: "",
    queue: 0,
    routeStatus: "Будни",
    exitNumbers: "",
  });

  const [exitConflictInfo, setExitConflictInfo] = useState<{ convoyNumber: number; exits: string[]; overlapping: string[] } | null>(null);
  const [queueConflictError, setQueueConflictError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const debouncedExitNumbers = useDebounce(formData.exitNumbers, 500);
  const convoyId = useMemo(() => {
    const raw = localStorage.getItem("authData");
    return raw ? JSON.parse(raw)?.convoyId : "";
  }, []);

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
    setExitConflictInfo(null);
    setQueueConflictError(null);
  }, [route]);

  const cleanExitNumbers = (input: string): string[] => {
    return Array.from(
      new Set(
        input
          .split(",")
          .map((n) => n.trim())
          .filter((n) => /^\d+$/.test(n)) // оставляем только числа
      )
    ).sort((a, b) => parseInt(a) - parseInt(b));
  };
  
  

  useEffect(() => {
    const checkQueue = async () => {
      if (!route && formData.queue > 0 && convoyId) {
        const res = await routeService.checkRouteQueue(convoyId, formData.queue);
        setQueueConflictError(res.isSuccess ? null : "Такая позиция уже занята в колонне");
      } else {
        setQueueConflictError(null);
      }
    };
    checkQueue();
  }, [formData.queue, convoyId, route]);

  useEffect(() => {
    const checkExits = async () => {
      if (!convoyId || !debouncedExitNumbers.trim() || !formData.number.trim()) {
        setExitConflictInfo(null);
        return;
      }
    
      const currentExits = cleanExitNumbers(debouncedExitNumbers);
    
      const res = await routeService.checkRoute(
        formData.number.trim(), 
        convoyId,
        toBackendStatus(formData.routeStatus)
      );
      const conflict = res.value?.[0];
    
      if (conflict?.busLineNumbers?.length) {
        const overlapping = currentExits.filter((exit) => conflict.busLineNumbers.includes(exit));
        if (overlapping.length > 0) {
          setExitConflictInfo({
            convoyNumber: conflict.convoyNumber,
            exits: conflict.busLineNumbers,
            overlapping,
          });
          return;
        }
      }
    
      setExitConflictInfo(null);
    };
    
    checkExits();
  }, [debouncedExitNumbers, formData.number, convoyId, formData.routeStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
  
    const cleanedExits = cleanExitNumbers(formData.exitNumbers);
  
    if (!formData.number.trim()) {
      toast({ title: "Ошибка", description: "Введите номер маршрута", variant: "destructive" });
      setIsChecking(false);
      return;
    }
  
    if (formData.queue <= 0) {
      toast({ title: "Ошибка", description: "Порядок должен быть больше 0", variant: "destructive" });
      setIsChecking(false);
      return;
    }
  
    if (cleanedExits.length === 0) {
      toast({ title: "Ошибка", description: "Укажите хотя бы один корректный выход", variant: "destructive" });
      setIsChecking(false);
      return;
    }
  
    if (queueConflictError) {
      toast({ title: "Ошибка", description: queueConflictError, variant: "destructive" });
      setIsChecking(false);
      return;
    }
  
    if (exitConflictInfo) {
      toast({
        title: "Ошибка",
        description: `Выходы ${exitConflictInfo.overlapping.join(", ")} уже заняты в автоколонне №${exitConflictInfo.convoyNumber}`,
        variant: "destructive",
      });
      setIsChecking(false);
      return;
    }
  
    const preparedData: RouteFormData = {
      number: formData.number.trim(),
      queue: formData.queue,
      exitNumbers: cleanedExits.join(", "), // 🟢 отправляем строку
      routeStatus: toBackendStatus(formData.routeStatus),
    };
  
    onSubmit(preparedData);
    setIsChecking(false);
  };
  

  const parsedExits = cleanExitNumbers(formData.exitNumbers);

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
            <Label htmlFor="queue">Порядок в разнарядке</Label>
            <Input
              id="queue"
              type="number"
              value={formData.queue}
              onChange={(e) => {
                const parsed = parseInt(e.target.value);
                setFormData({ ...formData, queue: isNaN(parsed) ? 0 : parsed });
              }}
              placeholder="1"
              required
            />
            {queueConflictError && <p className="text-red-500 text-sm">{queueConflictError}</p>}
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
              inputMode="text"
              value={formData.exitNumbers}
              onChange={(e) => setFormData({ ...formData, exitNumbers: e.target.value })}
              placeholder="Например: 1, 2, 3"
              required
            />

            <TooltipProvider>
              <div className="flex flex-wrap gap-2 mt-2">
                {parsedExits.map((exit, idx) => {
                  const isConflict = exitConflictInfo?.overlapping.includes(exit);
                  const badge = (
                    <Badge
                      key={idx}
                      className={isConflict ? "bg-red-100 text-red-700 border-red-300" : "bg-muted"}
                      variant={isConflict ? "destructive" : "outline"}
                    >
                      № {exit}
                    </Badge>
                  );

                  return isConflict ? (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>{badge}</TooltipTrigger>
                      <TooltipContent>
                        Занят в автоколонне №{exitConflictInfo?.convoyNumber}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    badge
                  );
                })}
              </div>
            </TooltipProvider>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isChecking || !!queueConflictError || !!exitConflictInfo}>
              {route ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
