"use client"

import type React from "react"
import type { WorkShiftType } from "@/types/coordinator.types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Calendar, X, Umbrella } from "lucide-react"

interface ShiftSelectorProps {
  currentShift: WorkShiftType
  onShiftSelect: (shiftType: WorkShiftType) => void
  disabled?: boolean
}

export const ShiftSelector: React.FC<ShiftSelectorProps> = ({
  currentShift,
  onShiftSelect,
  disabled = false,
}) => {
  const getStyle = (type: WorkShiftType) => {
    switch (type) {
      case "Day":
        return {
          label: "Дневная",
          bgColor: "bg-amber-100",
          textColor: "text-amber-800",
          borderColor: "border-amber-200",
          hoverColor: "hover:bg-amber-200",
          icon: <Sun className="h-4 w-4 mr-2" />,
        }
      case "Night":
        return {
          label: "Ночная",
          bgColor: "bg-purple-100",
          textColor: "text-purple-800",
          borderColor: "border-purple-200",
          hoverColor: "hover:bg-purple-200",
          icon: <Moon className="h-4 w-4 mr-2" />,
        }
      case "DayOff":
        return {
          label: "Выходной",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          hoverColor: "hover:bg-gray-200",
          icon: <Calendar className="h-4 w-4 mr-2" />,
        }
      case "Vacation":
        return {
          label: "Отпуск",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          hoverColor: "hover:bg-blue-200",
          icon: <Umbrella className="h-4 w-4 mr-2" />,
        }
      case "Skip":
        return {
          label: "Пропуск",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
          hoverColor: "hover:bg-red-200",
          icon: <X className="h-4 w-4 mr-2" />,
        }
      default:
        return {
          label: "—",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          hoverColor: "hover:bg-gray-200",
          icon: <Calendar className="h-4 w-4 mr-2" />,
        }
    }
  }

  const current = getStyle(currentShift)

  const options: WorkShiftType[] = ["Day", "Night", "DayOff", "Vacation", "Skip"]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className={`
          w-full h-8 rounded border px-2 py-1 text-xs font-medium flex items-center justify-center
          transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
          ${current.bgColor} ${current.textColor} ${current.borderColor}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {current.icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-40">
        {options.map((type) => {
          const style = getStyle(type)
          return (
            <DropdownMenuItem
              key={type}
              onClick={() => onShiftSelect(type)}
              className={`flex items-center ${style.hoverColor} ${style.textColor}`}
            >
              {style.icon}
              <span>{style.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
