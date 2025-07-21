// ReplaceAssignmentModal.tsx (финальная версия с выносом handleConfirm)
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
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"
import type { ReserveAssignment, ReserveReplacementCandidate, RouteAssignment } from "@/types/releasePlanTypes"
import type { RepairDto } from "@/types/repair.types"
import { toast } from "@/components/ui/use-toast"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"
import OrderReplacementList from "./ReplaceAssignmentModal/OrderReplacementList"
import RepairReplacementList from "./ReplaceAssignmentModal/RepairReplacementList"
import AssignmentReplacementList from "./ReplaceAssignmentModal/AssignmentReplacementList"
import StatusBanner from "./ReplaceAssignmentModal/StatusBanner"
import ReserveReplacementTable from "./ReplaceAssignmentModal/ReserveReplacementTable"
import FreeDriversGrid from "./ReplaceAssignmentModal/FreeDriversGrid"
import FreeBusesGrid from "./ReplaceAssignmentModal/FreeBusesGrid"
import { handleReplaceConfirm } from "./ReplaceAssignmentModal/handleReplaceConfirm"
import type { AssignmentReplacement } from "@/types/releasePlanTypes"

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
  const [orderReplacements, setOrderReplacements] = useState<ReserveAssignment[]>([])
  const [assignmentReplacements, setAssignmentReplacements] = useState<AssignmentReplacement[]>([])


  useEffect(() => {
    if (!open || !date || !convoyId) return
  
    fetchReserve()
    fetchFreeBuses()
    fetchFreeDrivers()
    fetchRepairs()
    fetchOrders()
    fetchAssignments()
  }, [open, date, convoyId])

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
      setOrderReplacements(res.value || [])
    } catch {
      toast({ title: "Ошибка загрузки заказов", variant: "destructive" })
    }
  }
  
  const fetchAssignments = async () => {
    try {
      const depotId = localStorage.getItem("busDepotId") // 👈 из localStorage
      if (!depotId) return
  
      const res = await releasePlanService.getExtendedAssignmentsByDepot(date, depotId)
      setAssignmentReplacements(res.value || [])
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
    orders: "Oder", // проверь, возможно должно быть "Order"
    repairs: "RearrangementRenovation",
    assignments: "RearrangingRoute",
    buses: "Permutation",
    drivers: "Permutation",
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

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
        <TabsList>
          <TabsTrigger value="reserve">Резерв</TabsTrigger>
          <TabsTrigger value="orders">С заказов</TabsTrigger>
          <TabsTrigger value="repairs">С планового ремонтов</TabsTrigger>
          <TabsTrigger value="assignments">С маршрутов</TabsTrigger>
          <TabsTrigger value="buses">Автобусы</TabsTrigger>
          <TabsTrigger value="drivers">Водители</TabsTrigger>
        </TabsList>


          <div className="my-2">
            <input
              type="text"
              placeholder="Поиск..."
              value={tab === "reserve" ? searchReserve : searchText}
              onChange={(e) => {
                tab === "reserve"
                  ? setSearchReserve(e.target.value)
                  : setSearchText(e.target.value)
              }}
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
              items={assignmentReplacements} // ✅ правильно
              selectedDriver={selectedDriver}
              selectedBus={selectedBus}
              onSelect={(driver, bus) => {
                setSelectedDriver(driver)
                setSelectedBus(bus)
              }}
              search={searchText}
              selectedRowKey={selectedRowKey}
              setSelectedRowKey={setSelectedRowKey}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button
            onClick={() => handleReplaceConfirm({
              selectedAssignment,
              selectedBus,
              selectedDriver,
              reserve,
              replacementType: tabToReplacementTypeMap[tab], // ⬅️ вот здесь
              onReplaceSuccess,
              onReload,
              onClose,
            })}
            
            disabled={!selectedBus && !selectedDriver}
          >
            Заменить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
