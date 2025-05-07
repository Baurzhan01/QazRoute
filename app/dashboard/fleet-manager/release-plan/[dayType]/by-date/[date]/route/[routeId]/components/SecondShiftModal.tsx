"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SearchInput from "@/app/dashboard/fleet-manager/release-plan/components/SearchInput";
import SelectableList from "../components/SelectableList";
import type { Departure } from "@/types/dispatch.types";
import type { DisplayDriver } from "@/types/driver.types";
import { DRIVER_STATUS_MAP, getStatus } from "../../../../../../utils/statusUtils";
import { useState, useMemo } from "react";

interface SecondShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  departure: Departure | null;
  availableDrivers: DisplayDriver[];
  schedules: any[]; // можно заменить на конкретный тип, если есть
  onSave: (driverId: string, shiftTime: string) => void;
}

export default function SecondShiftModal({
  isOpen,
  onClose,
  departure,
  availableDrivers,
  schedules,
  onSave,
}: SecondShiftModalProps) {
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null);
  const [shiftTime, setShiftTime] = useState("");

  const filteredDrivers = useMemo(() => {
    return availableDrivers.filter((d) =>
      d.fullName.toLowerCase().includes(driverSearchQuery.toLowerCase())
    );
  }, [availableDrivers, driverSearchQuery]);

  if (!departure) return null;

  const handleSave = () => {
    if (!selectedDriver) return;

    if (!shiftTime.match(/^\d{2}:\d{2}$/)) {
      alert("Введите время пересменки в формате ЧЧ:ММ");
      return;
    }

    onSave(selectedDriver.id, shiftTime);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначение 2-й смены</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Водитель</Label>
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
                return driver.driverStatus === "OnWork" || driver.driverStatus === "DayOff"
                  ? getStatus(DRIVER_STATUS_MAP, "DayOff")
                  : { label: "Недоступен", color: "red" as const };
              }}
              disableItem={(driver) => {
                const notAvailableStatuses = ["OnVacation", "OnSickLeave", "Fired", "Intern"];
                return notAvailableStatuses.includes(driver.driverStatus);
              }}
            />
          </div>

          <div>
            <Label>Время пересменки</Label>
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="HH:MM"
              value={shiftTime}
              onChange={(e) => setShiftTime(e.target.value)}
              maxLength={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave} disabled={!selectedDriver}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
