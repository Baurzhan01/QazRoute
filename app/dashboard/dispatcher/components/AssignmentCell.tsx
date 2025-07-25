"use client"

import { InfoCell } from "@/app/dashboard/fleet-manager/release-plan/components/InfoCell"
import type { RouteAssignment } from "@/types/releasePlanTypes"

interface AssignmentCellProps {
  assignment: RouteAssignment
  date: Date
  readOnly: boolean
  textClassName?: string
}

export default function AssignmentCell({ assignment, date, readOnly, textClassName }: AssignmentCellProps) {
  const {
    additionalInfo,
    dispatchBusLineId,
    status,
    releasedTime,
    isRealsed,
    bus,
    driver,
    oldBus,
    oldDriver,
  } = assignment as RouteAssignment & {
    oldBus?: { garageNumber?: string; stateNumber?: string }
    oldDriver?: { fullName?: string }
  }

  const showReleasedTime =
    releasedTime && releasedTime !== "00:00:00" && (status === 1 || isRealsed)

  const showReplacement = status === 2
  const showPermutation = status === 3
  const showRearrangingRoute = status === 5

  const permutationInfo = () => {
    const oldBusText = oldBus?.garageNumber ? `🚌 ${oldBus.garageNumber} → ${bus?.garageNumber}` : ""
    const oldDriverText = oldDriver?.fullName ? `👤 ${oldDriver.fullName} → ${driver?.fullName}` : ""
    return [oldBusText, oldDriverText].filter(Boolean).join(" · ")
  }

  return (
    <div className="flex flex-col leading-tight">
      {/* Основная ячейка с доп. информацией */}
      <InfoCell
        initialValue={additionalInfo ?? ""}
        assignmentId={dispatchBusLineId}
        date={date}
        type="route"
        busId={bus?.id ?? null}
        driverId={driver?.id ?? null}
        textClassName={textClassName}
        readOnly={readOnly}
      />

      {/* Статусы */}
      {showReplacement && (
        <span className="text-yellow-600 text-xs mt-1 italic">
          🔁 Замена с резерва
        </span>
      )}
      {showPermutation && (
        <span className="text-blue-600 text-xs mt-1 italic">
          🔄 Перестановка: {permutationInfo()}
        </span>
      )}
      {showRearrangingRoute && (
        <span className="text-blue-600 text-xs mt-1 italic">
          🔄 Перестановка по маршруту
        </span>
      )}
    </div>
  )
}
