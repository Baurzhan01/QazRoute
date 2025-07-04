"use client"

import { memo } from "react"
import PopoverEditor from "./PopoverEditor"
import type { RouteAssignment } from "@/types/releasePlanTypes"

interface AssignmentRowProps {
  a: RouteAssignment
  i: number
  readOnlyMode?: boolean
  displayDate: Date
}

function formatShortName(fullName?: string, serviceNumber?: string): string {
  if (!fullName) return "—"
  const [last, first = "", middle = ""] = fullName.split(" ")
  const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
  const nameShort = `${last} ${initials}`
  return serviceNumber ? `${nameShort} (№ ${serviceNumber})` : nameShort
}

function formatTime(time?: string): string {
  if (!time || time === "00:00:00") return "—"
  return time.slice(0, 5) // выводит только часы и минуты
}

const AssignmentRow = memo(function AssignmentRow({ a, i, readOnlyMode, displayDate }: AssignmentRowProps) {
  const primaryDriverName = formatShortName(a.driver?.fullName)
  const shift2DriverName = formatShortName(a.shift2Driver?.fullName, a.shift2Driver?.serviceNumber)

  return (
    <tr className="even:bg-gray-50 font-medium text-xl text-center">
      <td className="border px-1">{a.busLineNumber ?? "—"}</td>
      <td className="border px-1">{a.garageNumber}</td>
      <td className="border px-1">{a.stateNumber}</td>
      <td className="border px-1 text-left">{primaryDriverName}</td>
      <td className="border px-1">{a.driver?.serviceNumber ?? "—"}</td>
      <td className="border px-1">{formatTime(a.departureTime)}</td>
      <td className="border px-1 text-left">
        <PopoverEditor
          initialValue={a.additionalInfo ?? ""}
          assignmentId={a.dispatchBusLineId}
          date={displayDate}
          type="route"
          busId={null}
          driverId={null}
          readOnly={readOnlyMode}
        />
      </td>

      {a.shift2Driver && (
        <>
          <td className="border px-1 text-left">{a.shift2AdditionalInfo ?? "—"}</td>
          <td className="border px-1 text-left">{shift2DriverName}</td>
          <td className="border px-1">{a.shift2Driver?.serviceNumber ?? "—"}</td>
        </>
      )}

      <td className="border px-1">{formatTime(a.endTime)}</td>
    </tr>
  )
})

export default AssignmentRow
