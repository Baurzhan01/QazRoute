"use client"

import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { releasePlanService } from "@/service/releasePlanService"
import { formatDate } from "../convoy/[id]/release-plan/utils/dateUtils"
import { AlertTriangle, RefreshCcw, XCircle } from "lucide-react"

const colorOptions = ["#000000", "#dc3545", "#28a745", "#007bff", "#ffc107"]

interface InfoCellProps {
  initialValue: string
  assignmentId: string
  date: Date
  type?: "route" | "reserve" | "order"
  busId?: string | null
  driverId?: string | null
  readOnly?: boolean
  textClassName?: string
  onUpdateLocalValue?: (value: string) => void
  /** Текст, который ДОБАВЛЯЕМ к отображению (не сохраняется в БД). Например, резюме справок. */
  externalNote?: string
}

export function InfoCell({
  initialValue,
  assignmentId,
  date,
  type = "route",
  busId = null,
  driverId = null,
  readOnly = false,
  textClassName,
  onUpdateLocalValue,
  externalNote = "",
}: InfoCellProps) {
  const [value, setValue] = useState(initialValue ?? "")
  const [editing, setEditing] = useState(false)
  const [textColor, setTextColor] = useState("#000000")
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 })

  // ——— helpers ———
  const stripHtml = (str: string) => (str ? str.replace(/<[^>]+>/g, "") : "")
  const normalize = (s: string) =>
    stripHtml(s || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()

  const getIcon = () => {
    const clean = normalize(value)
    if (clean.includes("выехал на линию")) return null
    if (clean.includes("❌")) return <XCircle className="w-4 h-4 text-red-600 inline-block mr-1" />
    if (clean.includes("🔄")) return <RefreshCcw className="w-4 h-4 text-blue-600 inline-block mr-1" />
    if (clean.includes("🔁")) return <AlertTriangle className="w-4 h-4 text-yellow-600 inline-block mr-1" />
    return null
  }

  const handleSave = async () => {
    const trimmed = value.trim()
    const cleanText = stripHtml(trimmed)
    const norm = normalize(trimmed)
    const isSystemNote =
      norm.startsWith("🔁") || norm.startsWith("🔄") || norm.startsWith("❌")

    if (!assignmentId || trimmed === (initialValue ?? "").trim()) return

    if (isSystemNote) {
      toast({
        title: "Редактирование запрещено",
        description: "Это поле заполняется автоматически при замене",
        variant: "destructive",
      })
      setValue(initialValue)
      return
    }

    try {
      if (type === "reserve") {
        await releasePlanService.updateReserveAssignment(assignmentId, {
          busId,
          driverId,
          description: cleanText,
        })
      } else {
        await releasePlanService.updateBusLineDescription(
          assignmentId,
          formatDate(date),
          cleanText
        )
      }

      toast({ title: "Сохранено", description: "Доп. информация обновлена" })
      onUpdateLocalValue?.(cleanText)
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить" })
    }
  }

  useEffect(() => {
    setValue(initialValue ?? "")
  }, [initialValue])

  useEffect(() => {
    const val = normalize(value)
    if (val.includes("выехал на линию")) {
      setTextColor("#28a745")
    } else if (val.includes("снят с маршрута") || val === "сход с линии") {
      setTextColor("#dc3545")
    } else if (val.includes("назначен на маршрут")) {
      setTextColor("#007bff")
    } else {
      setTextColor("#000000")
    }
  }, [value])

  if (readOnly && !editing) {
    const cleanValue = stripHtml(value || "")
    const fallbackValue = stripHtml(initialValue || "")

    const normClean = normalize(value || "")
    const normFallback = normalize(initialValue || "")

    const isExitText = normClean.includes("выехал на линию")
    const isRemovedText =
      normClean.includes("снят с маршрута") ||
      normFallback === "сход с линии" ||
      normClean === "сход с линии"
    const isAssignedText = normClean.includes("назначен на маршрут")

    const baseText = cleanValue || fallbackValue // основной текст из БД/локального стейта
    const combinedText =
      externalNote && externalNote.trim().length > 0
        ? baseText
          ? `${baseText} · ${externalNote}` // оба есть
          : externalNote                        // только примечание (например, только справки)
        : baseText || "—"

    const icon =
      normClean === "сход с линии" || normFallback === "сход с линии"
        ? <XCircle className="w-4 h-4 text-red-600 inline-block mr-1" />
        : getIcon()

    const textClass = isExitText
      ? "text-green-600"
      : isRemovedText
      ? "text-red-600"
      : isAssignedText
      ? "text-blue-600"
      : "text-black"

    return (
      <div className={`w-full text-center font-bold text-[15px] leading-tight py-1 ${textClass}`}>
        {icon}
        <span>{combinedText}</span>
      </div>
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
        placeholder="Причина замены..."
        onBlur={() => {
          setEditing(false)
          if ((value ?? "").trim() !== (initialValue ?? "").trim()) handleSave()
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "Enter") {
            (e.target as HTMLInputElement).blur()
          }
        }}
        style={{ color: textColor }}
        maxLength={150}
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
