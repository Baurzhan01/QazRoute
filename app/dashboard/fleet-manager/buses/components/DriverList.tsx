// components/DriverList.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check, UserMinus } from "lucide-react";
import { useState } from "react";
import type { Driver } from "@/types/driver.types";
import { formatShortName } from "../utils/formatShortName";

interface DriverListProps {
  availableDrivers: Driver[];
  assignedDrivers: Driver[];
  onAssign: (driverId: string) => void;
  onUnassign: (driverId: string) => void;
}

export default function DriverList({
  availableDrivers,
  assignedDrivers,
  onAssign,
  onUnassign,
}: DriverListProps) {
  const [search, setSearch] = useState("");

  const filteredAvailable = availableDrivers.filter((d) =>
    (d.fullName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (d.serviceNumber?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Назначенные водители */}
      <div className="border rounded-lg p-3 bg-white shadow-sm">
        <h4 className="text-sm font-semibold mb-2">Назначенные водители</h4>
        {assignedDrivers.length > 0 ? (
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {assignedDrivers.map((driver) => (
              <div
                key={driver.id}
                className="flex justify-between items-center p-2 border rounded bg-muted hover:bg-accent"
              >
                <div>
                  <p className="font-bold">№ {driver.serviceNumber}</p>
                  <p className="text-sm text-gray-600">
                    {formatShortName(driver.fullName)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onUnassign(driver.id!)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-500">
            Нет назначенных водителей
          </p>
        )}
      </div>

      {/* Доступные водители */}
      <div className="border rounded-lg p-3 bg-white shadow-sm">
        <h4 className="text-sm font-semibold mb-2">Доступные водители</h4>

        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Поиск по ФИО или табельному номеру..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredAvailable.length > 0 ? (
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {filteredAvailable.map((driver) => (
              <div
                key={driver.id}
                className="flex justify-between items-center p-2 border rounded bg-muted hover:bg-accent"
              >
                <div>
                  <p className="font-bold">№ {driver.serviceNumber}</p>
                  <p className="text-sm text-gray-600">
                    {formatShortName(driver.fullName)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-green-500 hover:text-green-700 hover:bg-green-50"
                  onClick={() => onAssign(driver.id!)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-500">
            {search ? "Водители не найдены" : "Нет доступных водителей"}
          </p>
        )}
      </div>
    </div>
  );
}
