"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Bus, User, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { ReserveDepartureUI } from "@/types/reserve.types"
import { releasePlanService } from "@/service/releasePlanService"
import AssignmentDialog from "./AssignmentDialog"

interface ReserveDepartureExtended extends ReserveDepartureUI {
  justAdded?: boolean
  isEmptyRow?: boolean
}

interface ReserveTableProps {
  departures: ReserveDepartureExtended[]
  onAddAssignment: (departure: ReserveDepartureUI) => void
  onRemoveAssignment: (departureId: string) => void
  onUpdateDepartures: (departures: ReserveDepartureExtended[]) => void
  onUpdateAssignment: (updated: ReserveDepartureUI) => void
  date: string
  onReload?: () => void
  convoyId: string
}

export default function ReserveTable({
  departures,
  onAddAssignment,
  onRemoveAssignment,
  onUpdateDepartures,
  onUpdateAssignment,
  date,
  onReload,
  convoyId,
}: ReserveTableProps) {
  const [filterAssigned, setFilterAssigned] = useState<"all" | "assigned" | "unassigned">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDeparture, setSelectedDeparture] = useState<ReserveDepartureUI | null>(null)
  const [selectedBus, setSelectedBus] = useState<any>(null)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [busSearchQuery, setBusSearchQuery] = useState("")
  const [driverSearchQuery, setDriverSearchQuery] = useState("")

  const handleOpenDialog = (departure: ReserveDepartureUI) => {
    setSelectedDeparture(departure)
    setSelectedBus(departure.bus ?? null)
    setSelectedDriver(departure.driver ?? null)
    setBusSearchQuery("")
    setDriverSearchQuery("")
    setIsDialogOpen(true)
  }

  const handleSave = (bus: any, driver: any) => {
    if (!selectedDeparture) return
    onUpdateAssignment({
      ...selectedDeparture,
      bus: bus ?? undefined,
      driver: driver ?? undefined,
    })
  }

  const filteredDepartures = useMemo(() => {
    let filtered = departures;
    
    if (filterAssigned === "assigned") {
      filtered = departures.filter((d) => d.bus && d.driver)
    } else if (filterAssigned === "unassigned") {
      filtered = departures.filter((d) => !d.bus || !d.driver)
    }

    // Сортируем: сначала заполненные, потом пустые
    return filtered.sort((a, b) => {
      const aIsEmpty = !a.bus && !a.driver;
      const bIsEmpty = !b.bus && !b.driver;
      
      if (aIsEmpty && !bIsEmpty) return 1;
      if (!aIsEmpty && bIsEmpty) return -1;
      return 0;
    });
  }, [departures, filterAssigned])

  const handleAddEmptyRow = async () => {
    if (!date) {
      toast({ title: "Ошибка", description: "Дата не указана", variant: "destructive" })
      return
    }

    try {
      await releasePlanService.assignToReserve(date, [
        {
          busId: null,
          driverId: null,
          description: null,
        },
      ])

      toast({ title: "Пустая строка добавлена" })
      onReload?.()
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить строку",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-2 text-sm">
        <Button variant={filterAssigned === "all" ? "default" : "ghost"} onClick={() => setFilterAssigned("all")}>Все</Button>
        <Button variant={filterAssigned === "assigned" ? "default" : "ghost"} onClick={() => setFilterAssigned("assigned")}>Назначенные</Button>
        <Button variant={filterAssigned === "unassigned" ? "default" : "ghost"} onClick={() => setFilterAssigned("unassigned")}>Пустые</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr>
              <th className="border p-2 w-10">№</th>
              <th className="border p-2 w-32"><Bus className="w-4 h-4 inline text-gray-500 mr-1" />Гар. номер</th>
              <th className="border p-2 w-32">Гос. номер</th>
              <th className="border p-2 w-48"><User className="w-4 h-4 inline text-gray-500 mr-1" />ФИО</th>
              <th className="border p-2 w-28">Таб. номер</th>
              <th className="border p-2 w-28">Выход</th>
              <th className="border p-2 w-28">По графику</th>
              <th className="border p-2 min-w-[200px]">Доп. информация</th>
              <th className="border p-2 w-20">Пересм.</th>
              <th className="border p-2 w-48">ФИО (2 смена)</th>
              <th className="border p-2 w-28">Таб. № (2 смена)</th>
              <th className="border p-2 w-48">Доп. инфо (2 смена)</th>
              <th className="border p-2 w-28">Конец</th>
              <th className="border p-2 w-32">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartures.map((departure) => {
              const status = departure.bus && departure.driver
                ? "assigned"
                : departure.bus || departure.driver
                ? "partial"
                : "unassigned"

              const badge = {
                assigned: <Badge className="bg-green-100 text-green-800">Назначено</Badge>,
                partial: <Badge className="bg-yellow-100 text-yellow-800">Частично</Badge>,
                unassigned: <Badge className="bg-gray-100 text-gray-600">Пусто</Badge>,
              }[status]

              return (
                <tr key={departure.id} className={departure.justAdded ? "animate-fade-in bg-yellow-50" : ""}>
                  <td className="border p-2 text-center font-semibold">{departure.sequenceNumber}</td>
                  <td className="border p-2">{departure.bus?.garageNumber || badge}</td>
                  <td className="border p-2">{departure.bus?.govNumber || "—"}</td>
                  <td className="border p-2">{departure.driver?.fullName || "—"}</td>
                  <td className="border p-2">{departure.driver?.serviceNumber || "—"}</td>
                  <td className="border p-2">{departure.departureTime || "—"}</td>
                  <td className="border p-2">{departure.scheduleTime || "—"}</td>
                  <td className="border p-2 whitespace-pre-line">{departure.additionalInfo?.trim() || "—"}</td>
                  <td className="border p-2">—</td>
                  <td className="border p-2">{departure.shift2Driver?.fullName || "—"}</td>
                  <td className="border p-2">{departure.shift2Driver?.serviceNumber || "—"}</td>
                  <td className="border p-2">{departure.shift2AdditionalInfo || "—"}</td>
                  <td className="border p-2">{departure.endTime || "—"}</td>
                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={departure.bus ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                        onClick={() => handleOpenDialog(departure)}
                      >
                        {departure.bus ? (
                          <>
                            <Edit className="h-4 w-4 mr-1" /> Изменить
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" /> Назначить
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            await releasePlanService.removeFromReserve([departure.id])
                            toast({ title: "Удалено из резерва" })
                            onReload?.()
                          } catch {
                            toast({
                              title: "Ошибка",
                              description: "Не удалось удалить резерв",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-dashed"
          onClick={handleAddEmptyRow}
        >
          <Plus className="h-4 w-4 mr-1" /> Добавить строку
        </Button>
      </div>

      <AssignmentDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedDeparture={selectedDeparture}
        selectedBus={selectedBus}
        selectedDriver={selectedDriver}
        busSearchQuery={busSearchQuery}
        driverSearchQuery={driverSearchQuery}
        onBusSearchChange={setBusSearchQuery}
        onDriverSearchChange={setDriverSearchQuery}
        onSelectBus={setSelectedBus}
        onSelectDriver={setSelectedDriver}
        convoyId={convoyId}
        date={date}
        onSave={handleSave}
      />
    </div>
  )
}
