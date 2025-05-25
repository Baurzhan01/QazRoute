"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { releasePlanService } from "@/service/releasePlanService"
import { formatDate } from "../utils/dateUtils"

const colorOptions = ["#000000", "#dc3545", "#28a745", "#007bff", "#ffc107"]

interface InfoCellProps {
  initialValue: string
  assignmentId: string
  date: Date
  type?: "route" | "reserve"
  busId?: string | null
  driverId?: string | null
}

export function InfoCell({
  initialValue,
  assignmentId,
  date,
  type = "route",
  busId = null,
  driverId = null,
}: InfoCellProps) {
  const [value, setValue] = useState(initialValue ?? "")
  const [textColor, setTextColor] = useState("#000000")
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 })

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
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить" })
    }
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
        className="w-full text-xs p-1 border rounded outline-none"
        style={{ color: textColor }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
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
