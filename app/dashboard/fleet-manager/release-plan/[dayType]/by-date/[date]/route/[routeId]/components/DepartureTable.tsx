"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, X, Edit, Clock, UserPlus } from "lucide-react";
import type { Departure } from "@/types/releasePlanTypes";
import type { LocalDeparture } from "@/types/releasePlanTypes";

interface DepartureTableProps {
  departures: LocalDeparture[];
  onAddBus: (departure: LocalDeparture) => void;
  onRemoveAssignment: (departureId: string) => void;
  onEditAssignment: (departure: LocalDeparture) => void;
  onAddSecondShift: (departure: LocalDeparture) => void;
  onEditTime: (departure: LocalDeparture, type: "departureTime" | "scheduleTime" | "endTime") => void;
}

export default function DepartureTable({
  departures,
  onAddBus,
  onRemoveAssignment,
  onEditAssignment,
  onAddSecondShift,
  onEditTime,
}: DepartureTableProps) {
  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>Гар. номер</TableHead>
              <TableHead>Гос. номер</TableHead>
              <TableHead>ФИО (1 смена)</TableHead>
              <TableHead>Таб. номер</TableHead>
              <TableHead>Выход</TableHead>
              <TableHead>По графику</TableHead>
              <TableHead>Доп. инфо</TableHead>
              <TableHead>ФИО (2 смена)</TableHead>
              <TableHead>Таб. номер</TableHead>
              <TableHead>Пересменка</TableHead>
              <TableHead>Конец</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {departures.map((dep) => (
              <TableRow
                key={dep.id}
                className={dep.isModified ? "bg-yellow-50 hover:bg-yellow-100" : ""}
              >
                <TableCell>{dep.departureNumber}</TableCell>

                <TableCell>{dep.bus?.garageNumber ?? <AssignButton onClick={() => onAddBus(dep)} />}</TableCell>
                <TableCell>{dep.bus?.stateNumber ?? ""}</TableCell>
                <TableCell>{dep.driver?.fullName ?? ""}</TableCell>
                <TableCell>{dep.driver?.serviceNumber ?? ""}</TableCell>

                <TableCell>
                  <TimeButton label={dep.departureTime} onClick={() => onEditTime(dep, "departureTime")} />
                </TableCell>
                <TableCell>
                  <TimeButton label={dep.scheduleTime} onClick={() => onEditTime(dep, "scheduleTime")} />
                </TableCell>
                <TableCell>{dep.additionalInfo}</TableCell>

                <TableCell>
                  {dep.shift2Driver
                    ? dep.shift2Driver.fullName
                    : dep.bus
                      ? <AssignButton label="Добавить" icon={<UserPlus className="h-4 w-4 mr-1" />} onClick={() => onAddSecondShift(dep)} />
                      : ""}
                </TableCell>

                <TableCell>{dep.shift2Driver?.serviceNumber ?? ""}</TableCell>

                <TableCell>
                  <TimeButton label={dep.shift2Time ?? ""} onClick={() => onEditTime(dep, "endTime")} />
                </TableCell>

                <TableCell>
                  <TimeButton label={dep.endTime} onClick={() => onEditTime(dep, "endTime")} />
                </TableCell>

                <TableCell>
                  {dep.bus && <ActionButtons onEdit={() => onEditAssignment(dep)} onRemove={() => onRemoveAssignment(dep.id)} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}

function TimeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" onClick={onClick}>
          {label}
          <Clock className="ml-1 h-3 w-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">Изменить время</TooltipContent>
    </Tooltip>
  );
}

function AssignButton({
  onClick,
  label = "Назначить",
  icon = <Plus className="h-4 w-4 mr-1" />,
}: {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Button variant="ghost" size="sm" className="text-blue-500" onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
}

function ActionButtons({ onEdit, onRemove }: { onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="flex space-x-1">
      <Button variant="ghost" size="sm" onClick={onEdit}> <Edit className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="sm" className="text-red-500" onClick={onRemove}> <X className="h-4 w-4" /> </Button>
    </div>
  );
}
