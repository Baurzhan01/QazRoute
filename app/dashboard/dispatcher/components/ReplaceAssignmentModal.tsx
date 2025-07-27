"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { driverService } from "@/service/driverService"
import { busService } from "@/service/busService"
import { releasePlanService } from "@/service/releasePlanService"
import { repairService } from "@/service/repairService"
import { toast } from "@/components/ui/use-toast"
import type { RepairDto } from "@/types/repair.types"
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type {
  ReserveAssignment,
  ReserveReplacementCandidate,
  RouteAssignment,
  AssignmentReplacement,
} from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"
import OrderReplacementList from "./ReplaceAssignmentModal/OrderReplacementList"
import RepairReplacementList from "./ReplaceAssignmentModal/RepairReplacementList"
import AssignmentReplacementList from "./ReplaceAssignmentModal/AssignmentReplacementList"
import StatusBanner from "./ReplaceAssignmentModal/StatusBanner"
import ReserveReplacementTable from "./ReplaceAssignmentModal/ReserveReplacementTable"
import FreeDriversGrid from "./ReplaceAssignmentModal/FreeDriversGrid"
import FreeBusesGrid from "./ReplaceAssignmentModal/FreeBusesGrid"
import { handleReplaceConfirm } from "./ReplaceAssignmentModal/handleReplaceConfirm"
type AssignmentReplacementWithId = AssignmentReplacement & {
  dispatchBusLineId: string
}

interface ReplaceAssignmentModalProps {
  open: boolean
  onClose: () => void
  selectedAssignment: RouteAssignment
  date: string
  convoyId: string
  onReload?: () => void
  onReplaceSuccess?: (updated: RouteAssignment) => void
}

export default function ReplaceAssignmentModal({
  open,
  onClose,
  selectedAssignment,
  date,
  convoyId,
  onReload,
  onReplaceSuccess,
}: ReplaceAssignmentModalProps) {
  const [tab, setTab] = useState("reserve")
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null)
  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null)
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null)
  const [reserve, setReserve] = useState<ReserveReplacementCandidate[]>([])
  const [freeBuses, setFreeBuses] = useState<DisplayBus[]>([])
  const [freeDrivers, setFreeDrivers] = useState<DisplayDriver[]>([])
  const [searchText, setSearchText] = useState("")
  const [searchReserve, setSearchReserve] = useState("")
  const [repairReplacements, setRepairReplacements] = useState<RepairDto[]>([])
  const [orderReplacements, setOrderReplacements] = useState<ReserveReplacementCandidate[]>([])
  const [isFirstShift, setIsFirstShift] = useState<number>(1) // 1 по умолчанию
  const [assignmentReplacements, setAssignmentReplacements] = useState<AssignmentReplacementWithId[]>([])


  useEffect(() => {
    if (!open || !date || !convoyId) return

    fetchReserve()
    fetchFreeBuses()
    fetchFreeDrivers()
    fetchRepairs()
    fetchOrders()
    fetchAssignments()
  }, [open, date, convoyId])

  useEffect(() => {
    // при смене вкладки сбрасываем выбор
    setSelectedDriver(null)
    setSelectedBus(null)
    setSelectedRowKey(null)
    setIsFirstShift(1)
  }, [tab])

  const fetchRepairs = async () => {
    try {
      const res = await repairService.getRepairsByDate(date, convoyId)
      setRepairReplacements(res.value || [])
    } catch {
      toast({ title: "Ошибка загрузки ремонтов", variant: "destructive" })
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await releasePlanService.getReserveAssignmentsByDate(date, convoyId, "Order")
  
      const mapped = (res.value || []).map((item) => ({
        id: item.id,
        busId: item.dispatchBusLineId, // или другой подходящий ID автобуса
        driverId: item.driver.id,
        driverFullName: item.driver.fullName,
        driverTabNumber: item.driver.serviceNumber,
        garageNumber: item.garageNumber,
        govNumber: item.govNumber,
        isReplace: item.isReplace,
        description: item.additionalInfo ?? undefined,
      } satisfies ReserveReplacementCandidate))
  
      setOrderReplacements(mapped)
    } catch {
      toast({ title: "Ошибка загрузки заказов", variant: "destructive" })
    }
  }
  

  const fetchAssignments = async () => {
    try {
      const depotId = localStorage.getItem("busDepotId")
      if (!depotId) return
  
      const res = await releasePlanService.getExtendedAssignmentsByDepot(date, depotId)
  
      const mapped: AssignmentReplacementWithId[] = (res.value || []).map((item) => ({
        ...item,
        dispatchBusLineId: item.dispatchBusLineId || "", // fallback для безопасного доступа
      }))
      
  
      setAssignmentReplacements(mapped)
    } catch {
      toast({ title: "Ошибка загрузки выходов маршрутов", variant: "destructive" })
    }
  }
  

  const fetchReserve = async () => {
    try {
      const res = await releasePlanService.getReserveReplacementsByDate(date, convoyId)
      setReserve(res.value || [])
    } catch {
      toast({ title: "Ошибка загрузки резерва", variant: "destructive" })
    }
  }

  const fetchFreeBuses = async () => {
    try {
      const res = await busService.getWeekendBuses(date, convoyId)
      setFreeBuses(res.value || [])
    } catch {
      toast({ title: "Ошибка загрузки автобусов", variant: "destructive" })
    }
  }

  const fetchFreeDrivers = async () => {
    try {
      const res = await driverService.getWeekendDrivers(date, convoyId)
      setFreeDrivers(res.value || [])
    } catch {
      toast({ title: "Ошибка загрузки водителей", variant: "destructive" })
    }
  }

  const tabToReplacementTypeMap: Record<string, string> = {
    reserve: "Replaced",
    orders: "Oder", // ❗если ожидается именно "Oder", иначе поправь на "Order"
    repairs: "RearrangementRenovation",
    assignments: "RearrangingRoute",
    buses: "Permutation",
    drivers: "Permutation",
  }

  const reloadAssignmentReplacements = () => {
    fetchAssignments()
  }
  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[65vw] max-w-none">
        <DialogHeader>
          <DialogTitle>Замена на выходе</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Выберите водителя или автобус для замены на выбранном выходе
          </p>
          <StatusBanner
            selectedDriver={selectedDriver}
            selectedBus={selectedBus}
            currentTab={tab}
          />
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="reserve">Резерв</TabsTrigger>
            <TabsTrigger value="orders">С заказов</TabsTrigger>
            <TabsTrigger value="repairs">С ремонтов</TabsTrigger>
            <TabsTrigger value="assignments">С маршрутов</TabsTrigger>
            <TabsTrigger value="buses">Автобусы</TabsTrigger>
            <TabsTrigger value="drivers">Водители</TabsTrigger>
          </TabsList>

          <div className="my-2">
            <input
              type="text"
              placeholder="Поиск..."
              value={tab === "reserve" ? searchReserve : searchText}
              onChange={(e) =>
                tab === "reserve"
                  ? setSearchReserve(e.target.value)
                  : setSearchText(e.target.value)
              }
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>

          <TabsContent value="reserve">
            <ReserveReplacementTable
              reserve={reserve}
              selectedDriver={selectedDriver}
              selectedBus={selectedBus}
              onSelect={(driver, bus) => {
                setSelectedDriver(driver)
                setSelectedBus(bus)
              }}
              search={searchReserve}
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrderReplacementList
              items={orderReplacements}
              selectedDriver={selectedDriver}
              selectedBus={selectedBus}
              onSelect={(driver, bus) => {
                setSelectedDriver(driver)
                setSelectedBus(bus)
              }}
              search={searchText}
            />
          </TabsContent>

          <TabsContent value="repairs">
            <RepairReplacementList
              items={repairReplacements}
              selectedDriver={selectedDriver}
              selectedBus={selectedBus}
              onSelect={(driver, bus) => {
                setSelectedDriver(driver)
                setSelectedBus(bus)
              }}
              search={searchText}
            />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentReplacementList
              items={assignmentReplacements} // это уже AssignmentReplacementWithId[]
              selectedDriver={selectedDriver}
              selectedBus={selectedBus}
              onSelect={(driver, bus) => {
                setSelectedDriver(driver)
                setSelectedBus(bus)
              }}
              search={searchText}
              reloadAssignmentReplacements={reloadAssignmentReplacements} // ✅ вот это
            />
          </TabsContent>

          <TabsContent value="buses">
            <FreeBusesGrid
              buses={freeBuses}
              selectedBus={selectedBus}
              onSelect={setSelectedBus}
              search={searchText}
            />
          </TabsContent>

          <TabsContent value="drivers">
            <FreeDriversGrid
              drivers={freeDrivers}
              selectedDriver={selectedDriver}
              onSelect={setSelectedDriver}
              search={searchText}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            disabled={!selectedDriver && !selectedBus}
            onClick={() => {
              handleReplaceConfirm({
                selectedAssignment,
                isFirstShift: isFirstShift === 1,
                selectedBus,
                selectedDriver,
                reserve,
                replacementType: tabToReplacementTypeMap[tab],
                date, // 👈 добавлено
                onReplaceSuccess,
                onReload,
                onClose,
              })              
            }}
          >
            Заменить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
