"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { Dispatcher, DispatcherShift } from "../types/dispatcher.types"

interface DispatcherShiftDialogProps {
  isOpen: boolean
  onClose: () => void
  dispatcher: Dispatcher | null
  shifts: DispatcherShift[]
  loading: boolean
}

export function DispatcherShiftDialog({
  isOpen,
  onClose,
  dispatcher,
  shifts,
  loading,
}: DispatcherShiftDialogProps) {
  if (!dispatcher) return null

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: ru })
  }

  const getShiftLabel = (shiftType: string) => {
    switch (shiftType) {
      case "Day":
        return { label: "Дневная", className: "bg-blue-100 text-blue-800" }
      case "Night":
        return { label: "Ночная", className: "bg-indigo-100 text-indigo-800" }
      case "DayOff":
        return { label: "Выходной", className: "bg-gray-100 text-gray-800" }
      case "Vacation":
        return { label: "Отпуск", className: "bg-yellow-100 text-yellow-800" }
      case "Skip":
        return { label: "Пропуск", className: "bg-red-100 text-red-800" }
      default:
        return { label: "—", className: "bg-muted text-muted-foreground" }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Табель смен: {dispatcher.fullName}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Нет данных о сменах для этого диспетчера</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Тип смены</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => {
                  const { label, className } = getShiftLabel(shift.shiftType)
                  return (
                    <TableRow key={shift.date}>
                      <TableCell>{formatDate(shift.date)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${className}`}>
                          {label}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
