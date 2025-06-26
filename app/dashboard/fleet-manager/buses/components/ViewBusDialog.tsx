"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BusIcon,
  Users,
  Info,
  ClipboardList,
  BadgeInfo,
  Barcode,
  Calendar,
  Car,
  Gauge,
  Landmark,
} from "lucide-react";
import { getBusStatusInfo } from "../utils/busStatusUtils";
import type { BusWithDrivers } from "@/types/bus.types";

interface ViewBusDialogProps {
  bus: BusWithDrivers;
  open: boolean;
  onClose: () => void;
}

export default function ViewBusDialog({
  bus,
  open,
  onClose,
}: ViewBusDialogProps) {
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
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sky-800">
            <BusIcon className="h-6 w-6" />
            Информация об автобусе
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-2 text-gray-800">
          {/* Основная информация */}
          <div>
            <h4 className="text-base font-bold text-sky-700 mb-3 flex items-center gap-2">
              <Info className="h-5 w-5" /> Основные сведения
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Гаражный номер" icon={<Car />} value={bus.garageNumber} />
              <Field label="Гос. номер" icon={<BadgeInfo />} value={bus.govNumber} />
              <Field label="Марка" icon={<Landmark />} value={bus.brand} />
              <Field label="Тип" icon={<Barcode />} value={bus.type} />
              <Field label="VIN-код" icon={<ClipboardList />} value={bus.vinCode} />
              <Field label="Год выпуска" icon={<Calendar />} value={bus.year?.toString()} />
              <Field label="Номер техпаспорта" icon={<BadgeInfo />} value={bus.dataSheetNumber} />
              <Field label="Пробег" icon={<Gauge />} value={bus.mileage != null ? `${bus.mileage.toLocaleString("ru-RU")} км` : "—"} />
              <Field label="Колонна" icon={<Landmark />} value={convoyNumber} />
            </div>
          </div>

          {/* Статус */}
          <div>
            <h4 className="text-base font-bold text-sky-700 mb-2 flex items-center gap-2">
              <BusIcon className="h-5 w-5" />
              Статус автобуса
            </h4>
            <Badge className={`${color.bg} ${color.text} flex items-center gap-2 px-3 py-1 text-sm`}>
              <StatusIcon className="h-4 w-4" />
              {label}
            </Badge>
          </div>

          {/* Дополнительная информация */}
          <div>
            <h4 className="text-base font-bold text-sky-700 mb-2 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Доп. информация
            </h4>
            <p className="text-sm text-gray-700">
              {bus.additionalInfo || "Нет дополнительной информации"}
            </p>
          </div>

          {/* Водители */}
          <div>
            <h4 className="text-base font-bold text-sky-700 mb-2 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Назначенные водители
            </h4>

            {bus.drivers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bus.drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="border rounded-md p-3 bg-white shadow-sm flex flex-col"
                  >
                    <span className="text-sm font-semibold text-sky-800">
                      № {driver.serviceNumber}
                    </span>
                    <span className="text-sm text-gray-700">{driver.fullName}</span>
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

function Field({ label, icon, value }: { label: string; icon: React.ReactNode; value?: string | null }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-base font-medium break-words">{value || "—"}</p>
    </div>
  );
}
