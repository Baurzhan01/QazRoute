"use client";

import { memo, useMemo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Eye, UserMinus, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DriverStatusBadge from "./DriverStatusBadge";
import type { Driver, DriverStatus } from "@/types/driver.types";
import defaultAvatar from "@/public/images/driver_avatar.png";

/** Если с бэка приходят другие значения — здесь можно сопоставить. */
const mapDriverStatus = (s?: string): DriverStatus => {
  switch (s) {
    case "OnWork":
    case "OnVacation":
    case "OnSickLeave":
    case "Intern":
    case "Fired":
    case "DayOff":
      return s;
    default:
      return "DayOff"; // безопасный дефолт
  }
};

interface DriverRowProps {
  driver: Driver;
  rowNumber: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onAddToReserve: () => void;
  onRemoveFromReserve: () => void;
  inReserve: boolean;
}

function DriverRowInner({
  driver,
  rowNumber,
  onEdit,
  onDelete,
  onView,
  onAddToReserve,
  onRemoveFromReserve,
  inReserve,
}: DriverRowProps) {
  const initials = useMemo(() => {
    const parts = (driver.fullName || "").trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    return (driver.fullName || "??").substring(0, 2).toUpperCase();
  }, [driver.fullName]);

  const status = useMemo(() => mapDriverStatus((driver as any).driverStatus ?? (driver as any).status), [driver]);

  return (
    <TableRow>
      <TableCell className="font-medium">{rowNumber}</TableCell>

      <TableCell>
        <Avatar>
          <AvatarImage src={defaultAvatar.src} alt={driver.fullName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </TableCell>

      <TableCell className="font-medium">{driver.fullName}</TableCell>
      <TableCell>{driver.serviceNumber ?? "—"}</TableCell>
      <TableCell>{driver.phone ?? "—"}</TableCell>

      <TableCell>
        <DriverStatusBadge status={status} size="sm" />
      </TableCell>

      <TableCell>
        {driver.buses && driver.buses.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {driver.buses.map((bus) => (
              <span key={bus.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {bus.garageNumber}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-500">Не назначен</span>
        )}
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Меню действий по водителю">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>

            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Просмотр</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Редактировать</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {inReserve ? (
              <DropdownMenuItem onClick={onRemoveFromReserve}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Вернуть из резерва</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onAddToReserve}>
                <UserMinus className="mr-2 h-4 w-4" />
                <span>Перевести в резерв</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              <span>Удалить</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

/** Мемоизация, чтобы список не перерисовывался зря при пагинации/поиске. */
const DriverRow = memo(DriverRowInner, (prev, next) => {
  return (
    prev.inReserve === next.inReserve &&
    prev.rowNumber === next.rowNumber &&
    prev.driver.id === next.driver.id &&
    prev.driver.fullName === next.driver.fullName &&
    prev.driver.serviceNumber === next.driver.serviceNumber &&
    prev.driver.phone === next.driver.phone &&
    // грубая проверка статуса
    ((prev.driver as any).driverStatus ?? (prev.driver as any).status) ===
      ((next.driver as any).driverStatus ?? (next.driver as any).status) &&
    // простая поверхностная проверка списка автобусов
    (prev.driver.buses?.map((b) => b.id).join(",") ?? "") ===
      (next.driver.buses?.map((b) => b.id).join(",") ?? "")
  );
});

export default DriverRow;
