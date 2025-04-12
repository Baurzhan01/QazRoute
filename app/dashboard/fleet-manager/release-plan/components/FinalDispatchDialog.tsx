"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Download, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateLabel } from "../utils/dateUtils"
import type { FinalDispatch } from "../types/plan"

interface FinalDispatchDialogProps {
  open: boolean
  onClose: () => void
  dispatch: FinalDispatch
}

export default function FinalDispatchDialog({ open, onClose, dispatch }: FinalDispatchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Итоговая разнарядка на {formatDateLabel(dispatch.date)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Маршруты</h3>

            <div className="space-y-6">
              {dispatch.routeAssignments.map((route) => (
                <div key={route.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 p-3 border-b flex items-center">
                    <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center font-bold rounded-md mr-3">
                      {route.order}
                    </div>
                    <h4 className="font-bold text-lg">Маршрут № {route.number}</h4>
                    {route.name && <span className="ml-2 text-gray-600">({route.name})</span>}
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
                      {route.buses
                        .filter((bus) => !bus.isReserve)
                        .map((bus) => (
                          <TableRow key={bus.busId}>
                            <TableCell className="font-medium">{bus.garageNumber}</TableCell>
                            <TableCell>{bus.govNumber || "—"}</TableCell>
                            <TableCell>
                              {bus.driver ? (
                                <div>
                                  <div className="font-bold">№ {bus.driver.personnelNumber}</div>
                                  <div className="text-sm text-gray-600">
                                    {bus.driver.lastName} {bus.driver.firstName} {bus.driver.middleName}
                                  </div>
                                </div>
                              ) : (
                                "Не назначен"
                              )}
                            </TableCell>
                            <TableCell>{bus.driver?.shifts[0]?.departureTime || "—"}</TableCell>
                            <TableCell>{bus.driver?.shifts[1]?.departureTime || "—"}</TableCell>
                            <TableCell>{bus.endTime || "—"}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </div>

          {/* Резервные водители */}
          {dispatch.reserveDrivers.length > 0 && (
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
                  {dispatch.reserveDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-bold">№ {driver.personnelNumber}</TableCell>
                      <TableCell>
                        {driver.lastName} {driver.firstName} {driver.middleName}
                      </TableCell>
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