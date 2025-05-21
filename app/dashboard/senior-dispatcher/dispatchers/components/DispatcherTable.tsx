"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { DispatcherRow } from "./DispatcherRow"
import type { Dispatcher, DispatcherStatus } from "../types/dispatcher.types"

interface DispatcherTableProps {
  dispatchers: Dispatcher[]
  onEdit: (dispatcher: Dispatcher) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: DispatcherStatus) => void
  onViewShifts: (dispatcher: Dispatcher) => void
  onChangePassword: (id: string, newPassword: string) => void
  loading: boolean
}

export function DispatcherTable({
  dispatchers,
  onEdit,
  onDelete,
  onChangeStatus,
  onViewShifts,
  onChangePassword,
  loading
}: DispatcherTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>Логин</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Пароль</TableHead>
            <TableHead>Последняя активность</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Автоколонна</TableHead>
            <TableHead className="text-center">Смены</TableHead>
            <TableHead>Табель</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : dispatchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                Нет данных о диспетчерах
              </TableCell>
            </TableRow>
          ) : (
            dispatchers.map((dispatcher) => (
              <DispatcherRow
                key={dispatcher.id}
                dispatcher={dispatcher}
                onEdit={onEdit}
                onDelete={onDelete}
                onChangeStatus={onChangeStatus}
                onViewShifts={onViewShifts}
                onChangePassword={onChangePassword}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
