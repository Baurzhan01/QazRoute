"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import RouteGroupTable from "./RouteGroupTable"
import ReserveTable from "./ReserveTable"
import ConvoyHeader from "./ConvoyHeader"
import DriverStatusTables from "./DriverStatusTables"
import MaintenanceSummary from "./MaintenanceSummary"
import ViewDriverDialog from "@/app/dashboard/fleet-manager/drivers/components/ViewDriverDialog"
import ReplaceAssignmentModal from "./ReplaceAssignmentModal"
import OrderTable from "./OrderTable"
import ScheduledRepairTable from "./ScheduledRepairTable"
import { useDispatchTableState } from "../hooks/useDispatchTableState"
import { driverService } from "@/service/driverService"
import { releasePlanService } from "@/service/releasePlanService"
import { useConvoy } from "../context/ConvoyContext"
import { toast } from "@/components/ui/use-toast"
import type { FinalDispatchData, RouteAssignment, ValidDayType } from "@/types/releasePlanTypes"
import { countUniqueAssignments } from "../convoy/[id]/release-plan/utils/countUtils"

interface ConvoyDispatchTableProps {
  data: FinalDispatchData
  convoySummary?: {
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  }
  date?: string
  dayType?: ValidDayType
  readOnlyMode?: boolean
  selectedStatus?: string
  onlyChecked?: boolean
  onReload?: () => void
  search?: string
}

export default function ConvoyDispatchTable(props: ConvoyDispatchTableProps) {
  const {
    data,
    convoySummary,
    date,
    dayType,
    readOnlyMode = false,
    selectedStatus,
    onlyChecked,
    onReload,
    search,
  } = props

  const router = useRouter()
  const { convoyId } = useConvoy()
  const dateObj = date ? new Date(date) : new Date(data.date)

  const {
    fuelNorms,
    setFuelNorms,
    checkedDepartures,
    setCheckedDepartures,
    selectedAssignment,
    setSelectedAssignment,
    replaceModalOpen,
    setReplaceModalOpen,
    selectedDriver,
    setSelectedDriver,
    dialogOpen,
    setDialogOpen,
    showDayOffDrivers,
    setShowDayOffDrivers,
  } = useDispatchTableState(data)

  const handleDriverClick = async (driver: { id: string } | null) => {
    if (!driver?.id) return
    try {
      const response = await driverService.getById(driver.id)
      if (response.isSuccess && response.value) {
        setSelectedDriver(response.value)
        setDialogOpen(true)
      } else {
        toast({ title: "Ошибка", description: "Не удалось загрузить водителя", variant: "destructive" })
      }
    } catch (error) {
      console.error("Ошибка загрузки водителя:", error)
    }
  }

  const [onReplaceSuccess, setOnReplaceSuccess] = useState<((a: RouteAssignment) => void) | undefined>(undefined)

  const handleReplaceClick = (assignment: RouteAssignment, onSuccess: (a: RouteAssignment) => void) => {
    setSelectedAssignment(assignment)
    setOnReplaceSuccess(() => onSuccess)
    setReplaceModalOpen(true)
  }

  const handleRemoveClick = async (a: RouteAssignment) => {
    try {
      await releasePlanService.updateDispatchStatus(a.dispatchBusLineId, 3, false)
      toast({ title: "Снят с выхода", description: `Выход №${a.busLineNumber}`, variant: "default" })
      router.refresh()
    } catch {
      toast({ title: "Ошибка", description: "Не удалось снять с выхода", variant: "destructive" })
    }
  }

  const reserveRef = useRef<HTMLDivElement>(null)
  const scrollToReserve = () => reserveRef.current?.scrollIntoView({ behavior: "smooth" })

  const { driversAssigned, busesAssigned } = countUniqueAssignments(data.routeGroups, data.reserveAssignments)

  const isSearchMode = !!search?.trim()

  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
      <ConvoyHeader
        displayDate={dateObj}
        driversCount={convoySummary?.totalDrivers || 0}
        busesCount={convoySummary?.totalBuses || 0}
        driverOnWork={convoySummary?.driverOnWork ?? driversAssigned}
        busOnWork={convoySummary?.busOnWork ?? busesAssigned}
        onScrollToReserve={scrollToReserve}
      />
      {isSearchMode && data.routeGroups.length === 1 && data.routeGroups[0].assignments.length === 1 ? (
        <RouteGroupTable
          key={`search-${data.routeGroups[0].routeId}-${data.routeGroups[0].assignments[0].dispatchBusLineId}`}
          group={{
            ...data.routeGroups[0],
            assignments: [data.routeGroups[0].assignments[0]],
          }}
          displayDate={dateObj}
          readOnly={readOnlyMode}
          fuelNorms={fuelNorms}
          setFuelNorms={setFuelNorms}
          checkedDepartures={checkedDepartures}
          setCheckedDepartures={setCheckedDepartures}
          onDriverClick={handleDriverClick}
          onReplaceClick={handleReplaceClick}
          onRemoveClick={handleRemoveClick}
          onReload={() => router.refresh()}
        />
      ) : (
        data.routeGroups.map(group => (
          <RouteGroupTable
            key={group.routeId}
            group={group}
            displayDate={dateObj}
            readOnly={readOnlyMode}
            fuelNorms={fuelNorms}
            setFuelNorms={setFuelNorms}
            checkedDepartures={checkedDepartures}
            setCheckedDepartures={setCheckedDepartures}
            onDriverClick={handleDriverClick}
            onReplaceClick={handleReplaceClick}
            onRemoveClick={handleRemoveClick}
            onReload={() => router.refresh()}
            search={search}
          />
        ))
      )}
          <OrderTable
            orders={data.orders}
            displayDate={dateObj}
            fuelNorms={fuelNorms}
            setFuelNorms={setFuelNorms}
          />
      {data.reserveAssignments.length > 0 && (
        <div ref={reserveRef}>
          <ReserveTable
            departures={data.reserveAssignments}
            displayDate={dateObj}
            readOnly={readOnlyMode}
            fuelNorms={fuelNorms}
            setFuelNorms={setFuelNorms}
          />
        </div>
      )}

      <ScheduledRepairTable repairs={data.scheduledRepairs} />

      <MaintenanceSummary
        repairBuses={data.repairBuses}
        dayOffBuses={data.dayOffBuses}
        driverOnWork={driversAssigned}
        busOnWork={busesAssigned}
      />

      <DriverStatusTables
        date={data.date}
        driverStatuses={
          Object.fromEntries(
            Object.entries(data.driverStatuses).filter(([key]) => key !== "total")
          ) as Record<string, string[]>
        }
        showDayOffDrivers={showDayOffDrivers}
        toggleDayOffDrivers={() => setShowDayOffDrivers(prev => !prev)}
      />

      <ViewDriverDialog open={dialogOpen} onOpenChange={setDialogOpen} driver={selectedDriver} />
      {selectedAssignment && (
        <ReplaceAssignmentModal
          open={replaceModalOpen}
          onClose={() => {
            setReplaceModalOpen(false)
            setSelectedAssignment(null)
            setOnReplaceSuccess(undefined)
          }}
          selectedAssignment={selectedAssignment}
          date={data.date}
          convoyId={convoyId ?? ""}
          onReload={onReload}
          onReplaceSuccess={onReplaceSuccess}
        />
      )}
    </div>
  )
}
