"use client"

import { memo } from "react"
import PopoverEditor from "./PopoverEditor"
import type { RouteAssignment } from "@/types/releasePlanTypes"

interface AssignmentRowProps {
  a: RouteAssignment
  i: number
  readOnlyMode?: boolean
  displayDate: Date
  renderWithoutRoute?: boolean
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
  return time.slice(0, 5)
}

const AssignmentRow = memo(function AssignmentRow({ a, i, readOnlyMode, displayDate }: AssignmentRowProps) {
  const primaryDriverName = formatShortName(a.driver?.fullName)
  const shift2DriverName = formatShortName(a.shift2Driver?.fullName, a.shift2Driver?.serviceNumber)

  return (
    <>
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">{a.busLineNumber ?? "—"}</td>
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">{a.garageNumber}</td>
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">{a.stateNumber}</td>
      <td className="border px-1 text-left text-lg whitespace-pre-wrap break-words">{primaryDriverName}</td>
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">{a.driver?.serviceNumber ?? "—"}</td>
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">{formatTime(a.departureTime)}</td>
      <td className="border px-1 text-left text-lg whitespace-pre-wrap break-words">
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
          <td className="border px-1 text-left text-lg whitespace-pre-wrap break-words">{a.shift2AdditionalInfo ?? "—"}</td>
          <td className="border px-1 text-left text-lg whitespace-pre-wrap break-words">{shift2DriverName}</td>
          <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">{a.shift2Driver?.serviceNumber ?? "—"}</td>
        </>
      )}

      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">{formatTime(a.endTime)}</td>
    </>
  )
})

export default AssignmentRow
