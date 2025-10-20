"use client"

import { memo, startTransition, useEffect, useMemo, useState } from "react"
import RouteSection from "./RouteSection"
import ReserveRowSection from "./ReserveRowSection"
import BottomBlocks from "./BottomBlocks"
import type {
  FinalDispatchData,
  OrderAssignment,
  ReserveAssignmentUI,
  RouteGroup,
} from "@/types/releasePlanTypes"
import { mapToReserveAssignmentUI } from "../utils/releasePlanUtils"

interface FinalDispatchTableProps {
  data: FinalDispatchData
  depotNumber?: number
  driversCount: number
  busesCount: number
  convoySummary?: {
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  }
  dayType: string
  readOnlyMode?: boolean
  disableLinks?: boolean
  orderAssignments?: OrderAssignment[]
}

export default function FinalDispatchTable({
  data,
  depotNumber,
  driversCount,
  busesCount,
  convoySummary,
  dayType,
  readOnlyMode = false,
  disableLinks = false,
  orderAssignments = [],
}: FinalDispatchTableProps) {
  const {
    routeGroups = [],
    reserveAssignments = [],
    repairBuses = [],
    dayOffBuses = [],
    driverStatuses = {},
    date,
  } = data

  const displayDate = useMemo(() => new Date(date), [date])

  const mappedReserve = useMemo<ReserveAssignmentUI[]>(
    () => reserveAssignments.map((r, i) => mapToReserveAssignmentUI(r, i, "Reserved")),
    [reserveAssignments]
  )

  const mappedOrders = useMemo<ReserveAssignmentUI[]>(
    () => orderAssignments.map((r, i) => mapToReserveAssignmentUI(r, i, "Order")),
    [orderAssignments]
  )

  // Memoized wrappers to avoid unnecessary re-renders when props are stable
  const MemoRouteSection = useMemo(() => memo(RouteSection), [])
  const MemoReserveRowSection = useMemo(() => memo(ReserveRowSection), [])
  const MemoBottomBlocks = useMemo(() => memo(BottomBlocks), [])

  // Progressive rendering: show a slice first, then reveal all in a transition
  const INITIAL_SLICE = 20
  const [visibleCount, setVisibleCount] = useState(() => Math.min(routeGroups.length, INITIAL_SLICE))

  useEffect(() => {
    // Reset slice on dataset change for a quick first paint
    setVisibleCount(Math.min(routeGroups.length, INITIAL_SLICE))
    // Reveal the rest without blocking the main thread
    startTransition(() => {
      setVisibleCount(routeGroups.length)
    })
  }, [routeGroups.length])

  const visibleRouteGroups = useMemo(
    () => routeGroups.slice(0, visibleCount),
    [routeGroups, visibleCount]
  )

  const routeSections = useMemo(
    () =>
      visibleRouteGroups.map((group: RouteGroup) => (
        <MemoRouteSection
          key={group.routeId}
          group={group}
          date={date}
          dayType={dayType}
          displayDate={displayDate}
          readOnlyMode={readOnlyMode}
          disableLinks={disableLinks}
        />
      )),
    [visibleRouteGroups, date, dayType, displayDate, readOnlyMode, disableLinks, MemoRouteSection]
  )

  return (
    <div className="text-[18px] leading-relaxed space-y-1 text-gray-900">
      <div className="flex justify-between border px-6 py-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="space-y-1">
          <div>
            <strong>Водителей в колонне:</strong>{" "}
            {convoySummary?.totalDrivers ?? driversCount}
          </div>
          <div>
            <strong>Автобусов в колонне:</strong>{" "}
            {convoySummary?.totalBuses ?? busesCount}
          </div>
          <div>
            <strong>Привл. автобусов:</strong> 0
          </div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg tracking-wide">
            План выпуска · Колонна №{depotNumber ?? "—"}
          </div>
          <div className="text-xl font-bold tracking-wide">
            на {displayDate.toLocaleDateString("ru-RU")}
          </div>
        </div>
      </div>

      {routeSections}

      <MemoReserveRowSection
        title="РЕЗЕРВ"
        color="yellow"
        list={mappedReserve}
        dayType={dayType}
        date={date}
        disableLinks={disableLinks}
        readOnlyMode={readOnlyMode}
        displayDate={displayDate}
        linkPath="reserve"
      />

      <MemoReserveRowSection
        title="ЗАКАЗ"
        color="lime"
        list={mappedOrders}
        dayType={dayType}
        date={date}
        disableLinks={disableLinks}
        readOnlyMode={readOnlyMode}
        displayDate={displayDate}
        linkPath="orders"
      />

      <MemoBottomBlocks
        repairBuses={repairBuses}
        dayOffBuses={dayOffBuses}
        driverStatuses={{
          DayOff: driverStatuses.DayOff ?? [],
          OnVacation: driverStatuses.OnVacation ?? [],
          OnSickLeave: driverStatuses.OnSickLeave ?? [],
          Intern: driverStatuses.Intern ?? [],
          Fired: [],
          total: driversCount,
        }}
        convoySummary={convoySummary}
        date={date}
        disableLinks={disableLinks}
      />
    </div>
  )
}
