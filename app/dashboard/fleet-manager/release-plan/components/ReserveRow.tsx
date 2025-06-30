"use client"

import { memo, useMemo } from "react"
import PopoverEditor from "./PopoverEditor"
import type { ReserveAssignmentUI } from "@/types/releasePlanTypes"

interface ReserveRowProps {
  r: ReserveAssignmentUI
  i: number
  readOnlyMode?: boolean
  displayDate: Date
}

const formatShortName = (fullName?: string): string => {
  if (!fullName) return "—"
  const [last, first = "", middle = ""] = fullName.split(" ")
  const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
  return `${last} ${initials}`
}

const ReserveRow = memo(function ReserveRow({ r, i, readOnlyMode, displayDate }: ReserveRowProps) {
  const shortName = useMemo(() => formatShortName(r.driver?.fullName), [r.driver?.fullName])
  const rowNumber = r.sequenceNumber ?? i + 1

  return (
    <tr className="even:bg-gray-50 font-medium text-xl">
      <td className="border px-1 text-center">{rowNumber}</td>
      <td className="border px-1">{r.garageNumber || "—"}</td>
      <td className="border px-1">{r.govNumber || "—"}</td>
      <td className="border px-1">{shortName}</td>
      <td className="border px-1 text-center">{r.driver?.serviceNumber || "—"}</td>
      <td className="border px-1 text-center">{r.departureTime || "—"}</td>
      <td className="border px-1">
        {readOnlyMode ? (r.additionalInfo || "—") : (
          <PopoverEditor
            initialValue={r.additionalInfo ?? ""}
            assignmentId={r.id}
            date={displayDate}
            type="reserve"
            busId={r.busId ?? null}
            driverId={r.driver?.id ?? null}
            readOnly={readOnlyMode}
          />
        )}
      </td>
    </tr>
  )
})

export default ReserveRow
