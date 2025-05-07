"use client";

import { Eye, Edit, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

import { getBusStatusInfo } from "@/app/dashboard/fleet-manager/buses/utils/busStatusUtils";
import { formatShortName } from "../utils/formatShortName";
import { driverService } from "@/service/driverService";
import { busService } from "@/service/busService";

import type { BusWithDrivers } from "@/types/bus.types";
import type { Driver } from "@/types/driver.types";

interface BusCardProps {
  bus: BusWithDrivers;
  refetchBuses: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BusCard({
  bus,
  refetchBuses,
  onView,
  onEdit,
  onDelete,
}: BusCardProps) {
  const { color, icon: StatusIcon, label } = getBusStatusInfo(bus.busStatus);

  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverPage, setDriverPage] = useState(1);
  const [driverHasMore, setDriverHasMore] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const pageSize = 20;

  const fetchAvailableDrivers = async (page = 1) => {
    try {
      setLoadingDrivers(true); // 🚀 начинаем загрузку
  
      const convoyId = JSON.parse(localStorage.getItem("authData") || "{}").convoyId;
      if (!convoyId) return;
  
      const filter = {
        convoyId,
        page,
        pageSize,
        fullName: null,
        serviceNumber: null,
        address: null,
        phone: null,
        driverStatus: null,
      };
  
      const res = await driverService.filter(filter);
  
      if (res.isSuccess && res.value && "items" in res.value) {
        const newDrivers = res.value.items || [];
        setAvailableDrivers((prev) => [...prev, ...newDrivers]);
        setDriverHasMore(newDrivers.length === pageSize);
      }
    } catch (error) {
      console.error("Ошибка загрузки доступных водителей:", error);
    } finally {
      setLoadingDrivers(false); // ✅ загрузка завершена
    }
  };
  

  const handleOpenPopover = () => {
    setAvailableDrivers([]);
    setDriverPage(1);
    setDriverHasMore(true);
    fetchAvailableDrivers(1);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollTop + clientHeight >= scrollHeight - 50 && driverHasMore) {
      const nextPage = driverPage + 1;
      setDriverPage(nextPage);
      fetchAvailableDrivers(nextPage);
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    try {
      if (!bus.id) {
        console.error("ID автобуса отсутствует.");
        return;
      }

      await busService.assignDrivers(bus.id, [driverId]);
      toast({ title: "Успех", description: "Водитель успешно назначен!" });
      refetchBuses();
      setIsPopoverOpen(false); // Закрываем после назначения
    } catch (error) {
      console.error(error);
      toast({ title: "Ошибка", description: "Не удалось назначить водителя", variant: "destructive" });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Верх карточки */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${color.bg}`}>
              <StatusIcon className={`h-6 w-6 ${color.text}`} />
            </div>
            <div>
              <p className="font-bold">{bus.garageNumber}</p>
              <p className="text-sm text-gray-500">{bus.govNumber || "—"}</p>
            </div>
          </div>
          <Badge className={`${color.bg} ${color.text}`}>{label}</Badge>
        </div>

        {/* Водители */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Водители:</h4>
          {bus.drivers && bus.drivers.length > 0 ? (
            <div className="space-y-1">
              {bus.drivers.map((driver) => (
                <div key={driver.id} className="text-sm">
                  <span className="font-bold">№ {driver.serviceNumber}</span>{" "}
                  <span className="text-gray-600">{formatShortName(driver.fullName)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-400">Нет назначенных водителей</p>
          )}
        </div>

        {/* Действия */}
        <div className="flex flex-wrap gap-2 justify-end">
          {bus.id && (
            <>
              <Button size="icon" variant="ghost" onClick={() => onView(bus.id)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onEdit(bus.id)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-red-500" onClick={() => onDelete(bus.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Поповер для назначения */}
          {bus.drivers.length === 0 && (
            <Popover
              open={isPopoverOpen}
              onOpenChange={(open) => {
                setIsPopoverOpen(open);
                if (open) handleOpenPopover();
              }}
            >
              <PopoverTrigger asChild>
                <Button size="icon" variant="outline" title="Назначить водителя">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="text-sm font-semibold mb-2">Выберите водителя:</h4>
                  
                  <ScrollArea className="h-48" onScroll={handleScroll}>
                    <div className="flex flex-col gap-2">
                      {loadingDrivers ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Загружаем водителей...</p>
                        </div>
                      ) : availableDrivers.length > 0 ? (
                        availableDrivers.map((driver) => (
                          <Button
                            key={driver.id}
                            variant="ghost"
                            className="justify-start text-left"
                            onClick={() => handleAssignDriver(driver.id)}
                          >
                            № {driver.serviceNumber} {formatShortName(driver.fullName)}
                          </Button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">Нет доступных водителей</p>
                      )}
                    </div>
                  </ScrollArea>
                </motion.div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
