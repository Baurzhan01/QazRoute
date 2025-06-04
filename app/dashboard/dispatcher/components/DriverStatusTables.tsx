"use client"

import { useRouter } from "next/navigation"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"


interface DriverStatusTablesProps {
  date: string
  driverStatuses: Record<string, string[]>
  showDayOffDrivers: boolean
  toggleDayOffDrivers: () => void
}

export default function DriverStatusTables({
  date,
  driverStatuses,
  showDayOffDrivers,
  toggleDayOffDrivers,
}: DriverStatusTablesProps) {
  const router = useRouter()

  const renderTable = (
    title: string,
    list: string[] = [],
    statusKey?: "OnSickLeave" | "OnVacation" | "Intern",
    colorClass = "text-gray-700",
    toggleShow?: () => void,
    show: boolean = true
  ) => {
    const goToDriversPage = () => {
      const baseUrl = "/dashboard/fleet-manager/drivers"
      const url = statusKey
        ? `${baseUrl}?status=${statusKey}&date=${date}`
        : `${baseUrl}?date=${date}`
      router.push(url)
    }

    return (
      <div
        className={`bg-gray-50 border rounded-lg p-3 shadow-sm ${statusKey ? "hover:bg-gray-100 cursor-pointer" : ""}`}
        onClick={goToDriversPage}
      >
        <h4 className={`font-bold mb-2 flex items-center justify-between ${colorClass}`}>
          <span className="flex items-center gap-2">
            {title} <span className="text-sm text-gray-500">({list.length})</span>
          </span>
          {toggleShow && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleShow()
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {show ? "Скрыть" : "Показать"}
            </button>
          )}
        </h4>

        {show && (
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full border text-sm text-gray-900">
              <tbody>
                <tr className="flex flex-wrap gap-2">
                  {list.slice().sort().map((fullName, i) => (
                    <td
                      key={i}
                      className="border px-2 py-0.5 bg-white shadow-sm font-semibold"
                    >
                      {formatShortName(fullName)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!show && toggleShow && <div className="text-sm text-gray-400">Скрыто</div>}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-3 mt-3">
      {renderTable("\uD83D\uDC64 Водители на выходном", driverStatuses?.DayOff, undefined, "text-red-700", toggleDayOffDrivers, showDayOffDrivers)}
      {renderTable("\uD83E\uDD14 Больничный", driverStatuses?.OnSickLeave, "OnSickLeave", "text-orange-700")}
      {renderTable("\uD83C\uDFD6️ Отпуск", driverStatuses?.OnVacation, "OnVacation", "text-yellow-700")}
      {renderTable("\uD83E\uDDEA Стажёры", driverStatuses?.Intern, "Intern", "text-cyan-700")}
    </div>
  )
}
