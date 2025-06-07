"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { releasePlanService } from "@/service/releasePlanService"
import { formatDate } from "../convoy/[id]/release-plan/utils/dateUtils"
import { AlertTriangle, RefreshCcw, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const colorOptions = ["#000000", "#dc3545", "#28a745", "#007bff", "#ffc107"]

interface InfoCellProps {
  initialValue: string
  assignmentId: string
  date: Date
  type?: "route" | "reserve"
  busId?: string | null
  driverId?: string | null
  readOnly?: boolean
  textClassName?: string 
}

export function InfoCell({
  initialValue,
  assignmentId,
  date,
  type = "route",
  busId = null,
  driverId = null,
  readOnly = false,
}: InfoCellProps) {
  const [value, setValue] = useState(initialValue ?? "")
  const [editing, setEditing] = useState(false)
  const [textColor, setTextColor] = useState("#000000")
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 })
  const router = useRouter()

  const handleSave = async () => {
    if (!assignmentId) {
      toast({ title: "Ошибка", description: "Не указан ID назначения" })
      return
    }

    try {
      if (type === "reserve") {
        await releasePlanService.updateReserveAssignment(assignmentId, {
          busId,
          driverId,
          description: value.trim(),
        })
      } else {
        await releasePlanService.updateBusLineDescription(
          assignmentId,
          formatDate(date),
          value.trim()
        )
      }

      toast({ title: "Сохранено", description: "Доп. информация обновлена" })
      router.refresh()
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить" })
    }
  }

  const getIcon = () => {
    if (value.includes("❌"))
      return <XCircle className="w-4 h-4 text-red-600 inline-block mr-1" />
    if (value.includes("🔄"))
      return <RefreshCcw className="w-4 h-4 text-blue-600 inline-block mr-1" />
    if (value.includes("🔁"))
      return <AlertTriangle className="w-4 h-4 text-yellow-600 inline-block mr-1" />
    return null
  }

  if (readOnly && !editing) {
    return (
      <span
        className={`block text-xs px-1 py-0.5 rounded cursor-pointer`}
        style={{ color: textColor }}
        onClick={() => setEditing(true)}
        onContextMenu={(e) => {
          e.preventDefault()
          setAnchorPoint({ x: e.clientX, y: e.clientY })
          setShowColorMenu(true)
        }}
      >
        {getIcon()}
        {value || "—"}
      </span>
    )
  }

  return (
    <div
      className="relative"
      onContextMenu={(e) => {
        e.preventDefault()
        setAnchorPoint({ x: e.clientX, y: e.clientY })
        setShowColorMenu(true)
      }}
    >
      <input
        className="w-full text-xs px-1 py-0.5 border rounded outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        onBlur={() => {
          setEditing(false)
          if (value.trim() !== initialValue?.trim()) handleSave()
        }}
        style={{ color: textColor }}
      />

      {showColorMenu && (
        <div
          className="absolute z-50 border bg-white shadow rounded p-1"
          style={{ top: anchorPoint.y, left: anchorPoint.x }}
          onMouseLeave={() => setShowColorMenu(false)}
        >
          {colorOptions.map((color) => (
            <div
              key={color}
              className="w-6 h-6 rounded-full cursor-pointer border mb-1"
              style={{ backgroundColor: color }}
              onClick={() => {
                setTextColor(color)
                setShowColorMenu(false)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
