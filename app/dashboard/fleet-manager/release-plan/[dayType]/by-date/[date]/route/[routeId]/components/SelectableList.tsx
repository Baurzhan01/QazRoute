"use client"

import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import type { StatusType } from "../../../../../../utils/statusUtils"

interface SelectableListProps<T extends { id: string }> {
  items: T[]
  selected: T | null
  onSelect: (item: T) => void
  labelKey?: keyof T | ((item: T) => string)
  subLabelKey?: keyof T | ((item: T) => string)
  labelRender?: (item: T) => React.ReactNode
  subLabelRender?: (item: T) => React.ReactNode
  status?: (item: T) => StatusType
  disableItem?: (item: T) => boolean
  noAvailableMessage?: string
}

export default function SelectableList<T extends { id: string }>({
  items,
  selected,
  onSelect,
  labelKey,
  subLabelKey,
  labelRender,
  subLabelRender,
  status,
  disableItem,
  noAvailableMessage = "Нет доступных элементов",
}: SelectableListProps<T>) {
  if (!items.length) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500">
        {noAvailableMessage}
      </div>
    )
  }

  return (
    <div className="max-h-[280px] overflow-y-auto border rounded-md p-2 space-y-2">
      {items.map((item) => {
        const isSelected = selected?.id === item.id
        const isDisabled = disableItem?.(item) ?? false

        const label =
          labelRender?.(item) ??
          (typeof labelKey === "function"
            ? labelKey(item)
            : labelKey
            ? String(item[labelKey])
            : "")

        const subLabel =
          subLabelRender?.(item) ??
          (typeof subLabelKey === "function"
            ? subLabelKey(item)
            : subLabelKey
            ? String(item[subLabelKey])
            : null)

        const itemStatus = status
          ? status(item)
          : "isAssigned" in item && item.isAssigned
          ? { label: "НАЗНАЧЕН", color: "red" }
          : "isBusy" in item && item.isBusy
          ? { label: "НАЗНАЧЕН", color: "red" }
          : { label: "НЕ назначен", color: "green" }

        const statusColor = itemStatus.color ?? "gray"

        return (
          <div
            key={item.id}
            className={`p-2 rounded-md transition-colors flex justify-between items-center ${
              isSelected
                ? "bg-blue-50 border border-blue-200"
                : isDisabled
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-gray-50 cursor-pointer"
            }`}
            onClick={() => !isDisabled && onSelect(item)}
          >
            <div>
              <div className="font-semibold text-base">{label}</div>
              {subLabel && <div className="text-sm font-semibold text-gray-800">{subLabel}</div>}

              {itemStatus && (
                <div className="text-xs mt-1">
                  <Badge variant="outline" className={`bg-${statusColor}-100 text-${statusColor}-800`}>
                    {itemStatus.label}
                  </Badge>
                </div>
              )}
            </div>

            {isSelected && !isDisabled && (
              <Check className="w-4 h-4 text-blue-500 shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
