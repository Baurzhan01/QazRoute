"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput";
import SelectableList from "../components/SelectableList";
import type { Departure } from "@/types/dispatch.types";
import type { DisplayBus } from "@/types/bus.types";
import type { DisplayDriver } from "@/types/driver.types";
import { BUS_STATUS_MAP, DRIVER_STATUS_MAP, getStatus } from "../../../../../../utils/statusUtils";
import { busService } from "@/service/busService";

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departure: Departure | null;
  availableBuses: DisplayBus[];
  availableDrivers: DisplayDriver[];
  onSave: (updatedDeparture: Departure) => void;
}

export default function EditAssignmentModal({
  isOpen,
  onClose,
  departure,
  availableBuses,
  availableDrivers,
  onSave,
}: EditAssignmentModalProps) {
  const [busSearchQuery, setBusSearchQuery] = useState("");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [shift2DriverSearchQuery, setShift2DriverSearchQuery] = useState("");

  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(departure?.bus ?? null);
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(departure?.driver ?? null);
  const [selectedShift2Driver, setSelectedShift2Driver] = useState<DisplayDriver | null>(departure?.shift2Driver ?? null);

  const [availableBusDrivers, setAvailableBusDrivers] = useState<DisplayDriver[]>([]);

  const assignedBusIds = useMemo(() => {
    return availableBuses
      .filter((bus) => bus.assignedRoute && bus.assignedDeparture !== departure?.departureNumber)
      .map((bus) => bus.id);
  }, [availableBuses, departure?.departureNumber]);

  const assignedDriverIds = useMemo(() => {
    return availableDrivers
      .filter((driver) => driver.assignedRoute && driver.assignedDeparture !== departure?.departureNumber)
      .map((driver) => driver.id);
  }, [availableDrivers, departure?.departureNumber]);

  const filteredBuses = useMemo(() => {
    return availableBuses.filter((b) =>
      b.garageNumber.toLowerCase().includes(busSearchQuery.toLowerCase())
    );
  }, [availableBuses, busSearchQuery]);

  const filteredDrivers = useMemo(() => {
    return availableBusDrivers.filter((d) =>
      d.fullName.toLowerCase().includes(driverSearchQuery.toLowerCase())
    );
  }, [availableBusDrivers, driverSearchQuery]);

  const filteredShift2Drivers = useMemo(() => {
    return availableDrivers.filter((d) =>
      d.fullName.toLowerCase().includes(shift2DriverSearchQuery.toLowerCase())
    );
  }, [availableDrivers, shift2DriverSearchQuery]);

  // Когда выбран автобус — получить водителей на нем
  useEffect(() => {
    if (!selectedBus) {
      setAvailableBusDrivers([]);
      return;
    }

    busService.getById(selectedBus.id).then((res) => {
      const driversOnBus = res.value?.drivers ?? [];
      const mappedDrivers = driversOnBus.map((d: { id: string; fullName: string; serviceNumber: string }) =>
        availableDrivers.find((drv) => drv.id === d.id)
      ).filter(Boolean) as DisplayDriver[];      
      setAvailableBusDrivers(mappedDrivers);
    });
  }, [selectedBus, availableDrivers]);

  if (!departure) return null;

  const handleSave = () => {
    onSave({
      ...departure,
      bus: selectedBus ?? undefined,
      driver: selectedDriver ?? undefined,
      shift2Driver: selectedShift2Driver ?? undefined,
      shift2AdditionalInfo: departure.shift2AdditionalInfo ?? "",
      shift2Time: departure.shift2Time ?? "",
      isModified: true,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать назначение</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Автобус</Label>
            <SearchInput
              value={busSearchQuery}
              onChange={setBusSearchQuery}
              placeholder="Поиск автобуса..."
            />
            <SelectableList
              items={filteredBuses}
              selected={selectedBus}
              onSelect={setSelectedBus}
              labelKey="garageNumber"
              subLabelKey={(bus) => bus.stateNumber ?? bus.govNumber}
              status={(bus) => {
                if (assignedBusIds.includes(bus.id)) return { label: "Уже назначен", color: "yellow" as const };
                return bus.status === "OnWork" || bus.status === "DayOff"
                  ? getStatus(BUS_STATUS_MAP, "available")
                  : { label: "Недоступен", color: "red" as const };
              }}
              disableItem={(bus) => assignedBusIds.includes(bus.id) || ["UnderRepair", "LongTermRepair", "Decommissioned"].includes(bus.status)}
            />
          </div>

          {selectedBus && (
            <div>
              <Label>Водитель (1 смена)</Label>
              <SearchInput
                value={driverSearchQuery}
                onChange={setDriverSearchQuery}
                placeholder="Поиск водителя..."
              />
              <SelectableList
                items={filteredDrivers}
                selected={selectedDriver}
                onSelect={setSelectedDriver}
                labelKey="fullName"
                subLabelKey={(driver) => `№ ${driver.serviceNumber}`}
                status={(driver) => {
                  if (assignedDriverIds.includes(driver.id)) return { label: "Уже назначен", color: "yellow" as const };
                  return driver.driverStatus === "OnWork" || driver.driverStatus === "DayOff"
                    ? getStatus(DRIVER_STATUS_MAP, "DayOff")
                    : { label: "Недоступен", color: "red" as const };
                }}
                disableItem={(driver) => assignedDriverIds.includes(driver.id) || ["OnVacation", "OnSickLeave", "Fired", "Intern"].includes(driver.driverStatus)}
              />
            </div>
          )}

          {departure.shift2Driver && (
            <div>
              <Label>Водитель (2 смена)</Label>
              <SearchInput
                value={shift2DriverSearchQuery}
                onChange={setShift2DriverSearchQuery}
                placeholder="Поиск водителя..."
              />
              <SelectableList
                items={filteredShift2Drivers}
                selected={selectedShift2Driver}
                onSelect={setSelectedShift2Driver}
                labelKey="fullName"
                subLabelKey={(driver) => `№ ${driver.serviceNumber}`}
                status={(driver) => {
                  if (assignedDriverIds.includes(driver.id)) return { label: "Уже назначен", color: "yellow" as const };
                  return driver.driverStatus === "OnWork" || driver.driverStatus === "DayOff"
                    ? getStatus(DRIVER_STATUS_MAP, "DayOff")
                    : { label: "Недоступен", color: "red" as const };
                }}
                disableItem={(driver) => assignedDriverIds.includes(driver.id) || ["OnVacation", "OnSickLeave", "Fired", "Intern"].includes(driver.driverStatus)}
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
