"use client"

import { InfoCell } from "./InfoCell"
import type { RouteAssignment } from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"
import DispatchHistoryModal from "./DispatchHistoryModal"
import { useEffect, useState } from "react"

interface AssignmentCellProps {
  assignment: RouteAssignment
  date: Date
  readOnly: boolean
  textClassName?: string
  onUpdateLocalValue?: (value: string) => void
}

export default function AssignmentCell({ assignment, date, readOnly, textClassName, onUpdateLocalValue }: AssignmentCellProps) {
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
    replacementType,
  } = assignment as RouteAssignment & {
    oldBus?: { garageNumber?: string; stateNumber?: string }
    oldDriver?: { fullName?: string }
    replacementType?: string
  }

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLength, setHistoryLength] = useState(0)

  const handleInfoFromHistory = (text: string) => {
    onUpdateLocalValue?.(text)
  }

  const handleInfoFromHistoryModal = ({ text, exited, historyCount }: { text: string; exited: boolean; historyCount: number }) => {
    onUpdateLocalValue?.(text)
    setHistoryLength(historyCount)
  }

  const showReleasedTime =
    releasedTime && releasedTime !== "00:00:00" && (status === 1 || isRealsed)

  const showReplacement = status === 2 || replacementType === "Replaced"
  const showPermutation = status === 3 || replacementType === "Permutation"
  const showRearrangingRoute = status === DispatchBusLineStatus.RearrangingRoute
  const showGarageLaunch = status === DispatchBusLineStatus.LaunchedFromGarage

  const formatInitials = (fullName?: string) => {
    if (!fullName) return ""
    const [last, first, middle] = fullName.split(" ")
    const initials = [first?.[0], middle?.[0]].filter(Boolean).join(".")
    return `${last} ${initials}.`
  }

  const permutationInfo = () => {
    const oldBusText = oldBus?.garageNumber ? `🚌 ${oldBus.garageNumber} → ${bus?.garageNumber}` : ""
    const oldDriverText = oldDriver?.fullName
      ? `👤 ${formatInitials(oldDriver.fullName)} → ${formatInitials(driver?.fullName || "")}`
      : ""
    return [oldBusText, oldDriverText].filter(Boolean).join(" · ")
  }

  return (
    <>
      <div className="flex flex-col leading-tight">
        <InfoCell
          key={`${assignment.dispatchBusLineId}-${assignment.additionalInfo ?? ""}`}
          initialValue={additionalInfo ?? ""}
          assignmentId={dispatchBusLineId}
          date={date}
          type="route"
          busId={bus?.id ?? null}
          driverId={driver?.id ?? null}
          textClassName={textClassName}
          readOnly={readOnly}
          onUpdateLocalValue={handleInfoFromHistory}
        />

        {(historyLength > 0 || showGarageLaunch) && (
          <button
            onClick={() => setHistoryOpen(true)}
            className="text-xs text-sky-600 underline mt-1"
          >
            Журнал событий
          </button>
        )}

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
            🔄 Перестановка по маршруту: {permutationInfo()}
          </span>
        )}
      </div>
      <DispatchHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        dispatchId={dispatchBusLineId}
        onSetInfo={(payload) => handleInfoFromHistoryModal({ ...payload, historyCount: historyLength })}
        setHistoryLength={setHistoryLength}
      />
    </>
  )
}
