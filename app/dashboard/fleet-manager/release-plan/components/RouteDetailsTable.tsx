"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bus } from "lucide-react"
import type { RouteDispatchDetails } from "@/types/dispatch.types"

interface RouteDetailsTableProps {
  routeDetails: RouteDispatchDetails
}

export default function RouteDetailsTable({ routeDetails }: RouteDetailsTableProps) {
  const busLines = routeDetails.busLines ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-blue-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Автобусы на маршруте № {routeDetails.routeNumber}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ Выхода</TableHead>
                  <TableHead>Гаражный №</TableHead>
                  <TableHead>Гос. номер</TableHead>
                  <TableHead>Водитель 1</TableHead>
                  <TableHead>Водитель 2</TableHead>
                  <TableHead>Время выхода</TableHead>
                  <TableHead>Конец работы</TableHead>
                  <TableHead>Пересменка</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {busLines.length > 0 ? (
                  busLines.map((line, idx) => (
                    <TableRow key={line.id}>
                      <TableCell>{idx + 1}</TableCell>

                      {/* Автобус */}
                      <TableCell>{line.bus?.garageNumber || "—"}</TableCell>
                      <TableCell>{line.bus?.govNumber || "—"}</TableCell>

                      {/* Водитель 1 */}
                      <TableCell>
                        {line.driver1 ? (
                          <>
                            <div className="font-bold">№ {line.driver1.serviceNumber}</div>
                            <div className="text-sm text-gray-600">{line.driver1.fullName}</div>
                          </>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
                            Нет водителя
                          </Badge>
                        )}
                      </TableCell>

                      {/* Водитель 2 */}
                      <TableCell>
                        {line.driver2 ? (
                          <>
                            <div className="font-bold">№ {line.driver2.serviceNumber}</div>
                            <div className="text-sm text-gray-600">{line.driver2.fullName}</div>
                          </>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
                            Нет сменщика
                          </Badge>
                        )}
                      </TableCell>

                      {/* Времена */}
                      <TableCell>{formatTime(line.busLine.exitTime)}</TableCell>
                      <TableCell>{formatTime(line.busLine.endTime)}</TableCell>
                      <TableCell>{formatTime(line.scheduleShiftChange)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Назначения не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatTime(time?: { hour: number; minute: number }): string {
  if (!time) return "—"
  const hh = String(time.hour).padStart(2, "0")
  const mm = String(time.minute).padStart(2, "0")
  return `${hh}:${mm}`
}
