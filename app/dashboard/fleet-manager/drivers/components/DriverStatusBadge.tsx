import { Badge } from "@/components/ui/badge"
import type { DriverStatus } from "@/types/driver.types"

interface DriverStatusBadgeProps {
  status: DriverStatus
  size?: "sm" | "md" | "lg"
}

export default function DriverStatusBadge({ status, size = "md" }: DriverStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "OnWork":
        return {
          label: "На работе",
          variant: "success" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        }
      case "OnVacation":
        return {
          label: "В отпуске",
          variant: "outline" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        }
      case "OnSickLeave":
        return {
          label: "На больничном",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        }
      case "Intern":
        return {
          label: "На обучении",
          variant: "outline" as const,
          className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
        }
      case "Fired":
        return {
          label: "Отстранен",
          variant: "destructive" as const,
          className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
        }
      case "DayOff":
        return {
          label: "Выходной",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        }
      default:
        return {
          label: "Неизвестно",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        }
    }
  }

  const { label, className } = getStatusConfig()

  const sizeClass = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  }[size]

  return <Badge className={`font-medium ${className} ${sizeClass}`}>{label}</Badge>
}

