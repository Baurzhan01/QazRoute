"use client"

import { memo } from "react"
import InfoCell from "./InfoCell"

interface ReserveRowProps {
  r: any
  i: number
  readOnlyMode?: boolean
  displayDate: Date
}

const formatShortName = (fullName?: string) => {
  if (!fullName) return "—"
  const [last, first = "", middle = ""] = fullName.split(" ")
  const initials = `${first?.charAt(0)}.${middle?.charAt(0)}.`.toUpperCase()
  return `${last} ${initials}`
}

const ReserveRow = memo(function ReserveRow({
  r,
  i,
  readOnlyMode,
  displayDate,
}: ReserveRowProps) {
  return (
    <tr className="even:bg-gray-50 font-medium text-xl">
      <td className="border px-1 text-center">{r.sequenceNumber || i + 1}</td>
      <td className="border px-1">{r.garageNumber || "—"}</td>
      <td className="border px-1">{r.govNumber || "—"}</td>
      <td className="border px-1">{formatShortName(r.driver?.fullName || "—")}</td>
      <td className="border px-1 text-center">{r.driver?.serviceNumber || "—"}</td>
      <td className="border px-1 text-center">—</td>
      <td className="border px-1">
      <InfoCell
        initialValue={r.additionalInfo ?? ""}
        assignmentId={r.id} // ✅ исправлено!
        date={displayDate}
        type="reserve"
        busId={r.busId ?? null}
        driverId={r.driver?.id ?? null}
        textClassName="text-red-600 font-semibold text-sm"
        readOnly={readOnlyMode}
        />
      </td>
    </tr>
  )
})

export default ReserveRow
