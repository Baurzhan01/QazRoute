import React from "react"
import { cn } from "@/lib/utils"

export default function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase()
  const palette =
    s === "onwork" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    s === "repair" ? "bg-amber-100 text-amber-700 border-amber-200" :
    s === "reserve" ? "bg-sky-100 text-sky-700 border-sky-200" :
    s === "decommissioned" ? "bg-gray-100 text-gray-600 border-gray-200" :
    "bg-slate-100 text-slate-700 border-slate-200"

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
      palette
    )}>
      {status ?? "—"}
    </span>
  )
}
