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
import { Label } from "@/components/ui/label";
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput";
import SelectableList from "../components/SelectableList";

import type { Departure } from "@/types/dispatch.types";
import type { DisplayBus } from "@/types/bus.types";
import type { DisplayDriver } from "@/types/driver.types";
import { BUS_STATUS_MAP, DRIVER_STATUS_MAP, getStatus } from "../../../../../../utils/statusUtils";
import { busService } from "@/service/busService";
import { driverService } from "@/service/driverService";
import { releasePlanService } from "@/service/releasePlanService";
import { toast } from "@/components/ui/use-toast";

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departure: Departure | null;
  convoyId: string;
  date: string;
  onSave: (updatedDeparture: Departure) => void;
}

export default function EditAssignmentModal({
  isOpen,
  onClose,
  departure,
  convoyId,
  date,
  onSave,
}: EditAssignmentModalProps) {
  const [busSearchQuery, setBusSearchQuery] = useState("");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [shift2DriverSearchQuery, setShift2DriverSearchQuery] = useState("");

  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(departure?.bus ?? null);
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(departure?.driver ?? null);
  const [selectedShift2Driver, setSelectedShift2Driver] = useState<DisplayDriver | null>(departure?.shift2Driver ?? null);

  const [freeBuses, setFreeBuses] = useState<DisplayBus[]>([]);
  const [freeDrivers, setFreeDrivers] = useState<DisplayDriver[]>([]);
  const [busDrivers, setBusDrivers] = useState<DisplayDriver[]>([]);

  useEffect(() => {
    if (!departure || !isOpen) return;

    busService.getFreeBuses(date, convoyId).then((res) => {
      setFreeBuses(res.value ?? []);
    });

    driverService.getFreeDrivers(date, convoyId).then((res) => {
      setFreeDrivers(res.value ?? []);
    });
  }, [isOpen, date, convoyId, departure]);

  useEffect(() => {
    if (!selectedBus) return;

    busService.getById(selectedBus.id).then((res) => {
      const driversOnBus = res.value?.drivers ?? [];
      const mapped = driversOnBus.map((d: any) => {
        const full = freeDrivers.find((fd) => fd.id === d.id);
        return full ? full : null;
      }).filter(Boolean) as DisplayDriver[];
      setBusDrivers(mapped);
    });
  }, [selectedBus, freeDrivers]);

  if (!departure) return null;

  const handleSave = async () => {
    try {
      const payload = {
        dispatchBusLineId: departure.id,
        busId: selectedBus?.id ?? null,
        driver1Id: selectedDriver?.id ?? null,
        driver2Id: selectedShift2Driver?.id ?? null,
      };

      await releasePlanService.updateBusLineAssignment(date, payload);

      onSave({
        ...departure,
        bus: selectedBus ?? undefined,
        driver: selectedDriver ?? undefined,
        shift2Driver: selectedShift2Driver ?? undefined,
        shift2AdditionalInfo: departure.shift2AdditionalInfo ?? "",
        shift2Time: departure.shift2Time ?? "",
        isModified: true,
      });

      toast({ title: "Изменения сохранены" });
      onClose();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error?.response?.data?.error || "Не удалось сохранить изменения",
        variant: "destructive",
      });
    }
  };

  const filteredBuses = freeBuses.filter((b) => b.garageNumber.toLowerCase().includes(busSearchQuery.toLowerCase()));
  const filteredDrivers = busDrivers.filter((d) => d.fullName.toLowerCase().includes(driverSearchQuery.toLowerCase()));
  const filteredShift2Drivers = freeDrivers.filter((d) => d.fullName.toLowerCase().includes(shift2DriverSearchQuery.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать назначение</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Автобус</Label>
            <SearchInput value={busSearchQuery} onChange={setBusSearchQuery} placeholder="Поиск автобуса..." />
            <SelectableList
              items={filteredBuses}
              selected={selectedBus}
              onSelect={setSelectedBus}
              labelKey="garageNumber"
              subLabelKey={(bus) => bus.stateNumber ?? bus.govNumber}
              status={(bus) => getStatus(BUS_STATUS_MAP, bus.status)}
            />
          </div>

          {selectedBus && (
            <div>
              <Label>Водитель (1 смена)</Label>
              <SearchInput value={driverSearchQuery} onChange={setDriverSearchQuery} placeholder="Поиск водителя..." />
              <SelectableList
                items={filteredDrivers}
                selected={selectedDriver}
                onSelect={setSelectedDriver}
                labelKey="fullName"
                subLabelKey={(d) => `№ ${d.serviceNumber}`}
                status={(d) => getStatus(DRIVER_STATUS_MAP, d.driverStatus)}
              />
            </div>
          )}

          {departure.shift2Driver && (
            <div>
              <Label>Водитель (2 смена)</Label>
              <SearchInput value={shift2DriverSearchQuery} onChange={setShift2DriverSearchQuery} placeholder="Поиск водителя..." />
              <SelectableList
                items={filteredShift2Drivers}
                selected={selectedShift2Driver}
                onSelect={setSelectedShift2Driver}
                labelKey="fullName"
                subLabelKey={(d) => `№ ${d.serviceNumber}`}
                status={(d) => getStatus(DRIVER_STATUS_MAP, d.driverStatus)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
