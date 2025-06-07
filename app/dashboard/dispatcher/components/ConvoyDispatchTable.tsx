"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import RouteGroupTable from "./RouteGroupTable"
import ReserveTable from "./ReserveTable"
import ConvoyHeader from "./ConvoyHeader"
import DriverStatusTables from "./DriverStatusTables"
import MaintenanceSummary from "./MaintenanceSummary"
import ViewDriverDialog from "@/app/dashboard/fleet-manager/drivers/components/ViewDriverDialog"
import ReplaceAssignmentModal from "./ReplaceAssignmentModal"
import { useDispatchTableState } from "../hooks/useDispatchTableState"
import { driverService } from "@/service/driverService"
import { releasePlanService } from "@/service/releasePlanService"
import { useConvoy } from "../context/ConvoyContext"
import { toast } from "@/components/ui/use-toast"
import type { FinalDispatchData, RouteAssignment, ValidDayType } from "@/types/releasePlanTypes"
import { countUniqueAssignments } from "../convoy/[id]/release-plan/utils/countUtils"

export interface ConvoyDispatchTableProps {
  data: FinalDispatchData
  convoySummary?: {
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  }
  depotNumber?: number
  date?: string
  dayType?: ValidDayType
  readOnlyMode?: boolean
  selectedStatus?: string
  search?: string
  onlyChecked?: boolean
  onReload?: () => void
}

export default function ConvoyDispatchTable(props: ConvoyDispatchTableProps) {
  const {
    data,
    convoySummary,
    depotNumber,
    date,
    dayType,
    readOnlyMode = false,
    selectedStatus,
    search,
    onlyChecked,
    onReload,
  } = props

  const router = useRouter()
  const { convoyId } = useConvoy()
  const dateObj = date ? new Date(date) : new Date(data.date)
  const routeGroups = data.routeGroups ?? []
  const reserveAssignments = data.reserveAssignments ?? []
  const repairBuses = data.repairBuses ?? []
  const dayOffBuses = data.dayOffBuses ?? []
  const driverStatuses = data.driverStatuses ?? {}

  const [searchQuery, setSearchQuery] = useState(search || "")
  const [isSearchActive, setIsSearchActive] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearchActive(!!query)
  }

  const handleResetSearch = () => {
    setSearchQuery("")
    setIsSearchActive(false)
  }

  const reserveRef = useRef<HTMLDivElement>(null)

  const scrollToReserve = () => {
    reserveRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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
      toast({ title: "Ошибка", description: "Произошла ошибка при загрузке данных водителя", variant: "destructive" })
    }
  }

  const [onReplaceSuccess, setOnReplaceSuccess] = useState<((a: RouteAssignment) => void) | undefined>(undefined)

  const handleReplaceClick = (assignment: RouteAssignment, onSuccess: (a: RouteAssignment) => void) => {
    setSelectedAssignment(assignment)
    setOnReplaceSuccess(() => onSuccess)
    setReplaceModalOpen(true)
  }

  const handleRemoveClick = async (a: any) => {
    try {
      await releasePlanService.updateDispatchStatus(a.dispatchBusLineId, 3, false)
      toast({ title: "Снят с выхода", description: `Выход №${a.busLineNumber}`, variant: "default" })
      router.refresh()
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error)
      toast({ title: "Ошибка", description: "Не удалось снять с выхода", variant: "destructive" })
    }
  }

  const filteredGroups = useMemo(() => {
    const fullCopy = [...routeGroups]
  
    const filtered = fullCopy.map(group => {
      const filteredAssignments = group.assignments
        .filter(a => {
          if (!searchQuery) return true
          
          const searchLower = searchQuery.toLowerCase()
          const fullName = a.driver?.fullName?.toLowerCase() || ""
          const serviceNumber = a.driver?.serviceNumber || ""
          
          return fullName.includes(searchLower) || serviceNumber.includes(searchQuery)
        })
        .filter(a => {
          return !selectedStatus || a.status?.toString() === selectedStatus
        })
        .filter(a => {
          return !onlyChecked || checkedDepartures[a.dispatchBusLineId]
        })
  
      return {
        ...group,
        assignments: filteredAssignments,
      }
    })
  
    return filtered.filter(group => group.assignments.length > 0)
  }, [routeGroups, selectedStatus, searchQuery, onlyChecked, checkedDepartures])

  const filteredReserve = useMemo(() => {
    if (!searchQuery) return reserveAssignments

    const searchLower = searchQuery.toLowerCase()
    return reserveAssignments.filter(r => {
      const fullName = r.driver?.fullName?.toLowerCase() || ""
      const serviceNumber = r.driver?.serviceNumber || ""
      return fullName.includes(searchLower) || serviceNumber.includes(searchQuery)
    })
  }, [reserveAssignments, searchQuery])

  const { driversAssigned, busesAssigned } = countUniqueAssignments(routeGroups, reserveAssignments)

  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
      <ConvoyHeader
        displayDate={dateObj}
        driversCount={convoySummary?.totalDrivers || 0}
        busesCount={convoySummary?.totalBuses || 0}
        driverOnWork={convoySummary?.driverOnWork ?? driversAssigned}
        busOnWork={convoySummary?.busOnWork ?? busesAssigned}
        onScrollToReserve={scrollToReserve}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onResetSearch={handleResetSearch}
        isSearchActive={isSearchActive}
      />

      {filteredGroups.map(group => (
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
        />
      ))}
      {reserveAssignments.length > 0 && (
        <div ref={reserveRef}>
          <ReserveTable
            departures={filteredReserve}
            displayDate={dateObj}
            readOnly={readOnlyMode}
            fuelNorms={fuelNorms}
            setFuelNorms={setFuelNorms}
            search={searchQuery}
          />
        </div>
      )}

      <MaintenanceSummary
        repairBuses={repairBuses}
        dayOffBuses={dayOffBuses}
        driverOnWork={driversAssigned}
        busOnWork={busesAssigned}
      />

      <DriverStatusTables
        date={data.date}
        driverStatuses={
          Object.fromEntries(
            Object.entries(driverStatuses).filter(([key]) => key !== "total")
          ) as Record<string, string[]>
        }
        showDayOffDrivers={showDayOffDrivers}
        toggleDayOffDrivers={() => setShowDayOffDrivers(prev => !prev)}
      />

      <ViewDriverDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        driver={selectedDriver}
      />
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
