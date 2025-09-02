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
    <Table className="text-[15px] text-gray-900 leading-relaxed border">
      <TableHeader className="bg-sky-100 text-sky-900">
        <TableRow>
          <TableHead className="p-2">№</TableHead>
          <TableHead className="p-2">Гаражный №</TableHead>
          <TableHead className="p-2">Гос. №</TableHead>
          <TableHead className="p-2">Водитель (1 смена)</TableHead>
          <TableHead className="p-2">Таб. номер</TableHead>
          <TableHead className="p-2">Выход</TableHead>
          <TableHead className="p-2">Пересменка</TableHead>
          <TableHead className="p-2">2 смена</TableHead>
          <TableHead className="p-2">Время</TableHead>
          <TableHead className="p-2">Конец</TableHead>
          <TableHead className="p-2">Действия</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {departures.map((dep) => (
          <TableRow key={dep.id} className={dep.isModified ? "bg-yellow-50" : undefined}>
            <TableCell className="p-2 text-center">{dep.departureNumber}</TableCell>
            <TableCell className="p-2">{dep.bus?.garageNumber ?? "—"}</TableCell>
            <TableCell className="p-2">{dep.bus?.govNumber ?? "—"}</TableCell>
            <TableCell className="p-2">{dep.driver?.fullName ?? "—"}</TableCell>
            <TableCell className="p-2 text-center">{dep.driver?.serviceNumber ?? "—"}</TableCell>
            <TableCell className="p-2">
              <TimeButton label={dep.departureTime} onClick={() => onEditTime(dep, "exitTime")} />
            </TableCell>
            <TableCell className="p-2">
              <TimeButton
                label={
                  dep.busLine?.shiftChangeTime
                    ? dep.busLine.shiftChangeTime.substring(0, 5)
                    : (dep.shift2Time || "—")
                }
                onClick={() => onEditTime(dep, "shiftChangeTime")}
              />
            </TableCell>
            <TableCell className="p-2">
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
            <TableCell className="p-2">
            {dep.shift2Driver ? (
                  <span className="text-sm text-gray-600">
                    {dep.startShiftChangeTime?.substring(0, 5) || "—"}
                  </span>
                ) : (
                  "—"
                )}
            </TableCell>
            <TableCell className="p-2">
              <TimeButton label={dep.endTime} onClick={() => onEditTime(dep, "endTime")} />
            </TableCell>
            <TableCell className="p-2 flex gap-1">
              {dep.bus ? (
                <>
                  <Button size="icon" variant="ghost" onClick={() => onEditAssignment(dep)} title="Редактировать">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleRemove(dep)} title="Снять">
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
  );
}

function TimeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="text-muted-foreground">
      {label} <Clock className="ml-1 h-3 w-3" />
    </Button>
  );
}
