"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bus } from "lucide-react"
import type { RouteDetails } from "../types/plan"

interface RouteDetailsTableProps {
  routeDetails: RouteDetails
}

export default function RouteDetailsTable({ routeDetails }: RouteDetailsTableProps) {
  const regularBuses = routeDetails.buses.filter((bus) => !bus.isReserve)

  return (
    <div className="space-y-6">
      {/* Основные автобусы */}
      <Card>
        <CardHeader className="bg-blue-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Автобусы на маршруте
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                {regularBuses.map((bus) => (
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
                        <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
                          Не назначен
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {bus.driver?.shifts[0] && (
                        <div>
                          <div className="font-medium">{bus.driver.shifts[0].departureTime}</div>
                          <div className="text-xs text-gray-500">По графику: {bus.driver.shifts[0].scheduleTime}</div>
                          {bus.driver.shifts[0].additionalInfo && (
                            <div className="text-xs text-gray-500">{bus.driver.shifts[0].additionalInfo}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {bus.driver?.shifts[1] && (
                        <div>
                          <div className="font-medium">{bus.driver.shifts[1].departureTime}</div>
                          <div className="text-xs text-gray-500">По графику: {bus.driver.shifts[1].scheduleTime}</div>
                          {bus.driver.shifts[1].additionalInfo && (
                            <div className="text-xs text-gray-500">{bus.driver.shifts[1].additionalInfo}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{bus.endTime || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
