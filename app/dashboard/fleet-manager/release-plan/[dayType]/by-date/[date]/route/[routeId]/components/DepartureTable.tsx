"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Trash2, UserPlus } from "lucide-react";
import type { LocalDeparture } from "@/types/releasePlanTypes";
import { releasePlanService } from "@/service/releasePlanService";
import { toast } from "@/components/ui/use-toast";

interface DepartureTableProps {
  departures: LocalDeparture[];
  onAddBus: (departure: LocalDeparture) => void;
  onRemoveLocally: (departureId: string) => void;
  onEditAssignment: (departure: LocalDeparture) => void;
  onAddSecondShift: (departure: LocalDeparture) => void;
  onRemoveAssignment: (depId: string) => void;
  onEditTime: (
    departure: LocalDeparture,
    timeType: "exitTime" | "endTime" | "shiftChangeTime"
  ) => void;
  date: string;
}

export default function DepartureTable({
  departures,
  onAddBus,
  onRemoveLocally,
  onEditAssignment,
  onAddSecondShift,
  onRemoveAssignment,
  onEditTime,
  date,
}: DepartureTableProps) {
  const handleRemove = async (dep: LocalDeparture) => {
    try {
      await releasePlanService.updateBusLineAssignment(date, {
        dispatchBusLineId: dep.id,
        busId: null,
        driver1Id: null,
        driver2Id: null,
      });
      onRemoveLocally(dep.id);
      toast({ title: "Назначение снято" });
    } catch {
      toast({ title: "Ошибка при снятии назначения", variant: "destructive" });
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>№</TableHead>
            <TableHead>Гаражный №</TableHead>
            <TableHead>Гос. №</TableHead>
            <TableHead>Водитель (1 смена)</TableHead>
            <TableHead>Таб. номер</TableHead>
            <TableHead>Выход</TableHead>
            <TableHead>График</TableHead>
            <TableHead>2 смена</TableHead>
            <TableHead>Пересменка</TableHead>
            <TableHead>Конец</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {departures.map((dep) => (
            <TableRow key={dep.id} className={dep.isModified ? "bg-yellow-50" : undefined}>
              <TableCell>{dep.departureNumber}</TableCell>
              <TableCell>{dep.bus?.garageNumber ?? "—"}</TableCell>
              <TableCell>{dep.bus?.stateNumber ?? "—"}</TableCell>
              <TableCell>{dep.driver?.fullName ?? "—"}</TableCell>
              <TableCell>{dep.driver?.serviceNumber ?? "—"}</TableCell>
              <TableCell>
                <TimeButton label={dep.departureTime} onClick={() => onEditTime(dep, "exitTime")} />
              </TableCell>
              <TableCell>
                <TimeButton label={dep.scheduleTime} onClick={() => onEditTime(dep, "shiftChangeTime")} />
              </TableCell>
              <TableCell>
                {dep.shift2Driver ? (
                  dep.shift2Driver.fullName
                ) : dep.bus ? (
                  <Button variant="ghost" size="sm" onClick={() => onAddSecondShift(dep)}>
                    <UserPlus className="h-4 w-4 mr-1" /> Добавить
                  </Button>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{dep.shift2Time ?? "—"}</TableCell>
              <TableCell>
                <TimeButton label={dep.endTime} onClick={() => onEditTime(dep, "endTime")} />
              </TableCell>
              <TableCell className="flex gap-1">
                {dep.bus ? (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => onEditAssignment(dep)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleRemove(dep)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onAddBus(dep)}>Назначить</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TimeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="text-muted-foreground">
      {label} <Clock className="ml-1 h-3 w-3" />
    </Button>
  );
}
