"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { DispatcherStatusBadge } from "./DispatcherStatusBadge"
import { DispatcherActions } from "./DispatcherActions"
import type { Dispatcher, DispatcherStatus } from "../types/dispatcher.types"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface DispatcherRowProps {
  dispatcher: Dispatcher
  onEdit: (dispatcher: Dispatcher) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: DispatcherStatus) => void
  onViewShifts: (dispatcher: Dispatcher) => void
  onChangePassword: (id: string, newPassword: string) => void
}

export function DispatcherRow({
  dispatcher,
  onEdit,
  onDelete,
  onChangeStatus,
  onViewShifts,
  onChangePassword
}: DispatcherRowProps) {
  const formatDateTime = (dateTime: string | Date) =>
    format(new Date(dateTime), "dd.MM.yyyy HH:mm", { locale: ru })

  return (
    <TableRow>
      <TableCell className="font-medium">{dispatcher.fullName}</TableCell>
      <TableCell>{dispatcher.login}</TableCell>
      <TableCell>{dispatcher.email}</TableCell>
      <TableCell>••••••••</TableCell>
      <TableCell>{dispatcher.lastActivity ? formatDateTime(dispatcher.lastActivity) : "Нет данных"}</TableCell>
      <TableCell>
        <DispatcherStatusBadge status={dispatcher.status} />
      </TableCell>
      <TableCell>
        {dispatcher.convoy
            ? `${dispatcher.convoy.name} (${dispatcher.convoy.number})`
            : "—"}
        </TableCell>
      <TableCell className="text-center">{dispatcher.shiftsCount}</TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewShifts(dispatcher)}
          className="flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          Табель
        </Button>
      </TableCell>
      <TableCell>
        <DispatcherActions
          dispatcher={dispatcher}
          onEdit={onEdit}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
          onChangePassword={onChangePassword}
        />
      </TableCell>
    </TableRow>
  )
}
