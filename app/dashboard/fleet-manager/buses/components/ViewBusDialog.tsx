"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusIcon, Users } from "lucide-react";
import { getBusStatusInfo } from "../utils/busStatusUtils";
import type { BusWithDrivers } from "@/types/bus.types";

interface ViewBusDialogProps {
  bus: BusWithDrivers;
  open: boolean;
  onClose: () => void;
}

export default function ViewBusDialog({ bus, open, onClose }: ViewBusDialogProps) {
  const { color, icon: StatusIcon, label } = getBusStatusInfo(bus.busStatus);

  const [convoyNumber, setConvoyNumber] = useState<string | null>(null);

  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setConvoyNumber(parsed?.convoyNumber ?? null);
      } catch (error) {
        console.error("Ошибка чтения authData:", error);
      }
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BusIcon className="h-6 w-6 text-sky-600" />
            Информация об автобусе
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Гаражный номер</p>
              <p className="text-lg font-semibold">{bus.garageNumber}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Гос. номер</p>
              <p className="text-lg font-semibold">{bus.govNumber || "—"}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Статус</p>
              <Badge className={`${color.bg} ${color.text} flex items-center gap-1 mt-1`}>
                <StatusIcon className="h-3 w-3" />
                {label}
              </Badge>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Колонна</p>
              <p className="text-lg font-semibold">{convoyNumber ?? "—"}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Дополнительная информация</p>
              <p className="text-sm mt-1">{bus.additionalInfo || "Нет дополнительной информации"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-gray-500" />
              <p className="text-sm font-semibold">Назначенные водители</p>
            </div>

            {bus.drivers.length > 0 ? (
              <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                {bus.drivers.map((driver) => (
                  <div key={driver.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">№ {driver.serviceNumber}</p>
                      <p className="text-sm text-gray-600">{driver.fullName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">
                Водители ещё не назначены
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
