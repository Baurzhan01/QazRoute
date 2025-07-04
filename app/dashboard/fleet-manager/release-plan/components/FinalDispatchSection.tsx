"use client"

import { formatDateLabel, formatDayOfWeek } from "../utils/dateUtils"
import { Button } from "@/components/ui/button"
import FinalDispatchTable from "./FinalDispatchTable"
import type { FinalDispatchData, OrderAssignment } from "@/types/releasePlanTypes"

interface Props {
  data: FinalDispatchData
  convoyNumber: number
  convoySummary?: {
    totalDrivers?: number
    totalBuses?: number
    driverOnWork?: number
    busOnWork?: number
  }
  driversCount: number
  busesCount: number
  date: Date
  dayType: string
  readOnlyMode?: boolean
  disableLinks?: boolean
  orderAssignments?: OrderAssignment[]
}

export default function FinalDispatchSection({
  data,
  convoyNumber,
  convoySummary,
  driversCount,
  busesCount,
  date,
  dayType,
  readOnlyMode = false,
  disableLinks = false,
  orderAssignments = [],
}: Props) {
  return (
    <div className="rounded-xl border shadow-sm bg-white overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            План выпуска · Колонна №{convoyNumber}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDayOfWeek(date)}, {formatDateLabel(date)}
          </p>
        </div>
      </div>

      <div className="px-6 py-4">
        <FinalDispatchTable
          data={data}
          depotNumber={convoyNumber}
          convoySummary={convoySummary}
          driversCount={driversCount}
          busesCount={busesCount}
          dayType={dayType}
          readOnlyMode={readOnlyMode}
          disableLinks={disableLinks}
          orderAssignments={orderAssignments}
        />
      </div>
    </div>
  )
}
