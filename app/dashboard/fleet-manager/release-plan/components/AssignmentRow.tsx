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

const AssignmentRow = memo(function AssignmentRow({
  a,
  readOnlyMode,
  displayDate,
}: AssignmentRowProps) {
  const hasSecondShift = !!a.shift2Driver
  const primaryDriverName = formatShortName(a.driver?.fullName)
  const shift2DriverName = formatShortName(a.shift2Driver?.fullName, a.shift2Driver?.serviceNumber)

  // единая «Доп. информация» для обеих смен
  const InfoCell = (
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
  )

  return (
    <>
      {/* № выхода / гаражный / гос. номер */}
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">
        {a.busLineNumber ?? "—"}
      </td>
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">
        {a.garageNumber}
      </td>
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">
        {a.stateNumber}
      </td>

      {/* ФИО 1 смены + таб. номер (отдельной колонкой — как в шапке) */}
      <td className="border px-1 text-left text-lg whitespace-pre-wrap break-words">
        {primaryDriverName}
      </td>
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">
        {a.driver?.serviceNumber ?? "—"}
      </td>

      {/* Время выхода 1 смены */}
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">
        {formatTime(a.departureTime)}
      </td>

      {/* Если 2-й смены нет — «Доп. информация» здесь */}
      {!hasSecondShift && InfoCell}

      {/* Если 2-я смена есть — сначала её колонки, затем «Доп. информация» */}
      {hasSecondShift && (
        <>
          <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">
            {formatTime(a.shiftChangeTime)}
          </td>
          <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">
            {formatTime(a.startShift2Time)}
          </td>
          <td className="border px-1 text-left text-lg whitespace-pre-wrap break-words">
            {shift2DriverName}
          </td>
          {InfoCell}
        </>
      )}

      {/* Конец работы */}
      <td className="border px-1 text-center text-lg whitespace-pre-wrap break-words">
        {formatTime(a.endTime)}
      </td>
    </>
  )
})

export default AssignmentRow
