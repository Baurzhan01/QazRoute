"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash, Eye, UserMinus, UserPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DriverStatusBadge from "./DriverStatusBadge"
import type { Driver } from "@/types/driver.types"
import defaultAvatar from "@/public/images/driver_avatar.png"

interface DriverRowProps {
  driver: Driver
  rowNumber: number
  busInfo: any
  onEdit: () => void
  onDelete: () => void
  onView: () => void
  onAddToReserve: () => void
  onRemoveFromReserve: () => void
  inReserve: boolean
}

export default function DriverRow({
  driver,
  rowNumber,
  busInfo,
  onEdit,
  onDelete,
  onView,
  onAddToReserve,
  onRemoveFromReserve,
  inReserve,
}: DriverRowProps) {
  // Получаем инициалы для аватара
  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{rowNumber}</TableCell>
      <TableCell>
        <Avatar>
          <AvatarImage src={defaultAvatar.src} alt={driver.fullName} />
          <AvatarFallback>{getInitials(driver.fullName)}</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell>{driver.fullName}</TableCell>
      <TableCell>{driver.serviceNumber}</TableCell>
      <TableCell>{driver.phone}</TableCell>
      <TableCell>
        <DriverStatusBadge status={driver.driverStatus} />
      </TableCell>
      <TableCell>
        {busInfo ? (
          <div className="flex items-center">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{busInfo.garageNumber}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Не назначен</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Меню</span>
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
  )
}

