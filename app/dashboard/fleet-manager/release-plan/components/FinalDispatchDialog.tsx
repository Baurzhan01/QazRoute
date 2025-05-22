"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Download, FileText } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateLabel } from "../utils/dateUtils"
import type { FinalDispatchData, RouteGroup, RouteAssignment } from "@/types/releasePlanTypes"

interface FinalDispatchDialogProps {
  open: boolean
  onClose: () => void
  dispatch: FinalDispatchData
}

export default function FinalDispatchDialog({
  open,
  onClose,
  dispatch,
}: FinalDispatchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Итоговая разнарядка на {formatDateLabel(new Date(dispatch.date))}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 🔵 Маршруты */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Маршруты</h3>
            <div className="space-y-6">
              {dispatch.routeGroups.map((route: RouteGroup) => (
                <div key={route.routeId} className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 p-3 border-b flex items-center">
                    <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center font-bold rounded-md mr-3">
                      {route.routeNumber}
                    </div>
                    <h4 className="font-bold text-lg">Маршрут № {route.routeNumber}</h4>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Гаражный №</TableHead>
                        <TableHead>Гос. номер</TableHead>
                        <TableHead>Водитель</TableHead>
                        <TableHead>Смена 1</TableHead>
                        <TableHead>Смена 2</TableHead>
                        <TableHead>Конец работы</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {route.assignments.map((a: RouteAssignment, index) => (
                        <TableRow key={index}>
                          <TableCell>{a.garageNumber || "—"}</TableCell>
                          <TableCell>{a.stateNumber || "—"}</TableCell>
                          <TableCell>
                            {a.driver ? (
                              <>
                                <div className="font-bold">№ {a.driver.serviceNumber}</div>
                                <div className="text-sm text-gray-600">{a.driver.fullName}</div>
                              </>
                            ) : (
                              "Не назначен"
                            )}
                          </TableCell>
                          <TableCell>{a.departureTime || "—"}</TableCell>
                          <TableCell>{a.scheduleTime || "—"}</TableCell>
                          <TableCell>{a.endTime || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </div>

          {/* 🟠 Резервные водители */}
          {dispatch.reserveAssignments.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-4">Резерв водителей</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Табельный №</TableHead>
                    <TableHead>ФИО</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatch.reserveAssignments.map((r, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-bold">№ {r.driver.serviceNumber}</TableCell>
                      <TableCell>{r.driver.fullName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Скачать PDF
            </Button>
            <Button className="gap-2">
              <Printer className="h-4 w-4" />
              Печать
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
