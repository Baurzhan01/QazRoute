"use client"

import Link from "next/link"
import { memo } from "react"
import ReserveRow from "./ReserveRow"
import type { ReserveAssignmentUI } from "@/types/releasePlanTypes"

interface Props {
  title: string
  color: "yellow" | "emerald" | "lime"
  list: ReserveAssignmentUI[]
  dayType: string
  date: string
  disableLinks?: boolean
  readOnlyMode?: boolean
  displayDate: Date
  linkPath: string
}

const colorMap = {
  yellow: {
    base: "bg-yellow-300",
    hover: "hover:bg-yellow-400",
    side: "bg-yellow-200",
    head: "bg-yellow-100",
  },
  emerald: {
    base: "bg-emerald-300",
    hover: "hover:bg-emerald-400",
    side: "bg-emerald-200",
    head: "bg-emerald-100",
  },
  lime: {
    base: "bg-lime-300",
    hover: "hover:bg-lime-400",
    side: "bg-lime-200",
    head: "bg-lime-100",
  },
} as const

const ReserveRowSection = memo(function ReserveRowSection({
  title,
  color,
  list,
  dayType,
  date,
  disableLinks = false,
  readOnlyMode = false,
  displayDate,
  linkPath,
}: Props) {
  if (!list.length) return null

  const styles = colorMap[color] ?? colorMap.yellow

  return (
    <div className="flex mt-6 rounded shadow border overflow-hidden">
      {disableLinks ? (
        <div className={`${styles.side} text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] opacity-50 cursor-not-allowed`}>
          <div className="text-4xl font-extrabold leading-none">{title}</div>
        </div>
      ) : (
        <Link
          href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/${linkPath}?from=final-dispatch`}
          className={`${styles.base} ${styles.hover} text-black flex flex-col items-center justify-center px-6 py-2 min-w-[110px] transition`}
        >
          <div className="text-4xl font-extrabold leading-none">{title}</div>
        </Link>
      )}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className={`${styles.head} text-black`}>
            <tr>
              <th className="border px-1 text-xl">№</th>
              <th className="border px-1 text-xl">Гар. номер</th>
              <th className="border px-1 text-xl">Гос. номер</th>
              <th className="border px-1 text-xl">ФИО</th>
              <th className="border px-1 text-xl">Таб. номер</th>
              <th className="border px-1 text-xl">Время выхода</th>
              <th className="border px-1 text-xl">Доп. информация</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r, i) => (
              <ReserveRow
                key={r.id || i}
                r={r}
                i={i}
                readOnlyMode={readOnlyMode}
                displayDate={displayDate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default ReserveRowSection