"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput";
import SelectableList from "../components/SelectableList";
import type { DisplayBus } from "@/types/bus.types";
import type { DisplayDriver } from "@/types/driver.types";
import type { LocalDeparture } from "@/types/releasePlanTypes";
import { getStatus, isAvailableBusStatus, BUS_STATUS_MAP, DRIVER_STATUS_MAP } from "../../../../../../utils/statusUtils";
import { busService } from "@/service/busService";
import { driverService } from "@/service/driverService";
import { releasePlanService } from "@/service/releasePlanService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

interface AssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDeparture: LocalDeparture | null;
  selectedBus: DisplayBus | null;
  selectedDriver: DisplayDriver | null;
  busSearchQuery: string;
  driverSearchQuery: string;
  onBusSearchChange: (query: string) => void;
  onDriverSearchChange: (query: string) => void;
  onSelectBus: (bus: DisplayBus) => void;
  onSelectDriver: (driver: DisplayDriver) => void;
  assignedBusesMap: Record<string, { routeNumber: string; departureNumber: number }>;
  assignedDriversMap: Record<string, { routeNumber: string; departureNumber: number }>;
  routeId: string;
  date: string;
  convoyId: string;
  
  // ⬇️ ВОТ ЭТИ ДВА ОБЯЗАТЕЛЬНО!
  filteredBuses: DisplayBus[];
  filteredDrivers: DisplayDriver[];

  onSaved: (bus: DisplayBus | null, driver: DisplayDriver | null) => void;
}


export default function AssignmentDialog({
  open,
  onClose,
  selectedDeparture,
  selectedBus,
  selectedDriver,
  busSearchQuery,
  driverSearchQuery,
  onBusSearchChange,
  onDriverSearchChange,
  onSelectBus,
  onSelectDriver,
  assignedBusesMap,
  assignedDriversMap,
  routeId,
  date,
  convoyId,
  onSaved,
}: AssignmentDialogProps) {
  const queryClient = useQueryClient();
  const [availableBuses, setAvailableBuses] = useState<DisplayBus[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DisplayDriver[]>([]);
  const [noAvailableDrivers, setNoAvailableDrivers] = useState(false);
  const [freeDriverIds, setFreeDriverIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !selectedDeparture) return;

    busService.getFreeBuses(date, convoyId).then(res => setAvailableBuses(res.value ?? []));
    driverService.getFreeDrivers(date, convoyId).then(res => {
      setFreeDriverIds(new Set((res.value ?? []).map((d) => d.id as string)));
    });
  }, [open, date, convoyId, selectedDeparture]);

  useEffect(() => {
    if (!selectedBus) {
      setAvailableDrivers([]);
      setNoAvailableDrivers(false);
      return;
    }

    busService.getById(selectedBus.id).then((res) => {
      const driversOnBus = res.value?.drivers ?? [];

      const mappedDrivers: DisplayDriver[] = driversOnBus.map((d: { id: string; fullName: string; serviceNumber: string }) => ({
        id: d.id,
        fullName: d.fullName,
        serviceNumber: d.serviceNumber,
        convoyId,
        driverStatus: "OnWork",
      }));
      

      const filtered = mappedDrivers.filter((driver) => !assignedDriversMap[driver.id]);
      setAvailableDrivers(filtered);
      setNoAvailableDrivers(filtered.length === 0);
    });
  }, [selectedBus, assignedDriversMap, convoyId]);

  if (!selectedDeparture) return null;

  const handleSave = async () => {
    if (!selectedDeparture || !selectedBus) return;

    if (assignedBusesMap[selectedBus.id]) {
      toast({ title: "Автобус уже назначен", variant: "destructive" });
      return;
    }

    if (selectedDriver && assignedDriversMap[selectedDriver.id]) {
      toast({ title: "Водитель уже назначен", variant: "destructive" });
      return;
    }

    try {
      await releasePlanService.assignToBusLine(date, {
        dispatchBusLineId: selectedDeparture.id,
        busId: selectedBus.id,
        driver1Id: selectedDriver?.id ?? null,
        driver2Id: null,
      });

      await queryClient.invalidateQueries({ queryKey: ["routeAssignments", routeId, date] });

      onSaved(selectedBus, selectedDriver ?? null);
      toast({ title: "Назначение сохранено" });
      onClose();
    } catch {
      toast({ title: "Ошибка при назначении", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначение автобуса и водителя</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Автобус</Label>
            <SearchInput value={busSearchQuery} onChange={onBusSearchChange} placeholder="Поиск автобуса..." />
            <SelectableList
              items={availableBuses}
              selected={selectedBus}
              onSelect={onSelectBus}
              labelKey="garageNumber"
              subLabelKey={(bus) => bus.govNumber}
              status={(bus) =>
                assignedBusesMap[bus.id]
                  ? { label: "Уже назначен", color: "yellow" }
                  : isAvailableBusStatus(bus.status)
                    ? getStatus(BUS_STATUS_MAP, "available")
                    : { label: "Недоступен", color: "red" }
              }
              disableItem={(bus) => !!assignedBusesMap[bus.id] || ["UnderRepair", "LongTermRepair", "Decommissioned"].includes(bus.status)}
            />
          </div>

          {selectedBus && (
            <div>
              <Label>Водитель</Label>
              <SearchInput value={driverSearchQuery} onChange={onDriverSearchChange} placeholder="Поиск водителя..." />
              <SelectableList
                items={availableDrivers}
                selected={selectedDriver}
                onSelect={onSelectDriver}
                labelKey="fullName"
                subLabelKey={(driver) => `№ ${driver.serviceNumber}`}
                status={(driver) =>
                  assignedDriversMap[driver.id]
                    ? { label: "Уже назначен", color: "yellow" }
                    : freeDriverIds.has(driver.id)
                      ? getStatus(DRIVER_STATUS_MAP, "DayOff")
                      : { label: "Недоступен", color: "red" }
                }
                disableItem={(driver) => !!assignedDriversMap[driver.id] || !freeDriverIds.has(driver.id)}
              />
              {noAvailableDrivers && <div className="text-gray-500 text-sm mt-2">На данный автобус не назначено водителей</div>}
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
