"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" // ✅ добавлен импорт
import type { FinalDispatchData, ValidDayType } from "@/types/releasePlanTypes"
import type { Driver } from "@/types/driver.types"
import RouteGroupTable from "./RouteGroupTable"
import ReserveTable from "./ReserveTable"
import ConvoyHeader from "./ConvoyHeader"
import DriverStatusTables from "./DriverStatusTables"
import MaintenanceSummary from "./MaintenanceSummary"
import ViewDriverDialog from "@/app/dashboard/fleet-manager/drivers/components/ViewDriverDialog"
import ReplaceAssignmentModal from "./ReplaceAssignmentModal"
import { driverService } from "@/service/driverService"
import { releasePlanService } from "@/service/releasePlanService"
import { useConvoy } from "../context/ConvoyContext"

interface ConvoyDispatchTableProps {
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

export default function ConvoyDispatchTable({
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
}: ConvoyDispatchTableProps) {
  const router = useRouter() // ✅ добавлена инициализация router
  const { convoyId } = useConvoy()
  const dateObj = date ? new Date(date) : new Date(data.date)
  const routeGroups = data.routeGroups ?? []
  const reserveAssignments = data.reserveAssignments ?? []
  const repairBuses = data.repairBuses ?? []
  const dayOffBuses = data.dayOffBuses ?? []
  const driverStatuses = data.driverStatuses ?? {}

  const [fuelNorms, setFuelNorms] = useState<Record<string, string>>({})
  
  const [showDayOffDrivers, setShowDayOffDrivers] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [replaceModalOpen, setReplaceModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [checkedDepartures, setCheckedDepartures] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!data?.routeGroups) return
  
    const initialChecked: Record<string, boolean> = {}
  
    data.routeGroups.forEach(group => {
      group.assignments.forEach(a => {
        if (a.status === 1) {
          initialChecked[a.dispatchBusLineId] = true
        }
      })
    })
  
    setCheckedDepartures(initialChecked)
  }, [data])  

  const handleDriverClick = async (driver: { id: string } | null) => {
    if (!driver?.id) return
    try {
      const response = await driverService.getById(driver.id)
      if (response.isSuccess && response.value) {
        setSelectedDriver(response.value)
        setDialogOpen(true)
      }
    } catch (error) {
      console.error("Ошибка загрузки водителя:", error)
    }
  }

  const handleReplaceClick = (assignment: any) => {
    setSelectedAssignment(assignment)
    setReplaceModalOpen(true)
  }

  const handleRemoveClick = async (a: any) => {
    try {
      await releasePlanService.updateDispatchStatus(a.dispatchBusLineId, 3)
      onReload?.()
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error)
    }
  }

  const filteredGroups = routeGroups
    .map(group => ({
      ...group,
      assignments: group.assignments.filter(a => {
        const matchStatus = !selectedStatus || a.status?.toString() === selectedStatus
        const matchSearch =
          !search ||
          a.driver?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          a.driver?.serviceNumber?.includes(search)
        const matchChecked = !onlyChecked || checkedDepartures[a.dispatchBusLineId]
        return matchStatus && matchSearch && matchChecked
      })
    }))
    .filter(group => group.assignments.length > 0)

  const driversAssigned = new Set<string>()
  const busesAssigned = new Set<string>()

  routeGroups.forEach(group => {
    group.assignments.forEach(a => {
      if (a.driver?.serviceNumber) driversAssigned.add(a.driver.serviceNumber)
      if (a.shift2Driver?.serviceNumber) driversAssigned.add(a.shift2Driver.serviceNumber)
      if (a.garageNumber) busesAssigned.add(a.garageNumber)
    })
  })

  reserveAssignments.forEach(r => {
    if (r.driver?.serviceNumber) driversAssigned.add(r.driver.serviceNumber)
    if (r.garageNumber) busesAssigned.add(r.garageNumber)
  })

  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
      <ConvoyHeader
        displayDate={dateObj}
        driversCount={convoySummary?.totalDrivers || 0}
        busesCount={convoySummary?.totalBuses || 0}
        driverOnWork={convoySummary?.driverOnWork}
        busOnWork={convoySummary?.busOnWork}
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
          onReload={() => router.refresh()} // ✅ обновление через router
        />
      ))}

      {reserveAssignments.length > 0 && (
        <ReserveTable
          departures={reserveAssignments}
          displayDate={dateObj}
          readOnly={readOnlyMode}
          fuelNorms={fuelNorms}
          setFuelNorms={setFuelNorms}
        />
      )}

      <MaintenanceSummary
        repairBuses={repairBuses}
        dayOffBuses={dayOffBuses}
        driverOnWork={driversAssigned.size}
        busOnWork={busesAssigned.size}
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

      <ReplaceAssignmentModal
        open={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        selectedAssignment={selectedAssignment}
        date={data.date}
        convoyId={convoyId ?? ""}
        onReload={onReload}
      />
    </div>
  )
}
