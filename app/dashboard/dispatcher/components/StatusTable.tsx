"use client"

import { useRouter } from "next/navigation"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"

interface StatusTableProps {
  title: string
  list?: string[]
  statusKey?: "OnSickLeave" | "OnVacation" | "Intern"
  colorClass?: string
  date: string
  toggleShow?: () => void
  show?: boolean
}

export default function StatusTable({
  title,
  list = [],
  statusKey,
  colorClass = "text-gray-700",
  date,
  toggleShow,
  show = true,
}: StatusTableProps) {
  const router = useRouter()

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
                  <td key={i} className="border px-2 py-0.5 bg-white shadow-sm font-semibold">
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
