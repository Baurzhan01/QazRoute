import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils" // если нет — просто убери cn и склей строкой
import type { DriverStatus } from "@/types/driver.types"

interface DriverStatusBadgeProps {
  status: DriverStatus
  size?: "sm" | "md" | "lg"
}

const LABELS: Record<DriverStatus, string> = {
  OnWork: "На работе",
  OnVacation: "В отпуске",
  OnSickLeave: "На больничном",
  Intern: "На обучении",
  Fired: "Отстранен",
  DayOff: "Выходной",
}

const STYLES: Record<DriverStatus, string> = {
  OnWork: "!bg-green-100 !text-green-800 ring-1 ring-green-200",
  OnVacation: "!bg-blue-100 !text-blue-800 ring-1 ring-blue-200",
  OnSickLeave: "!bg-red-100 !text-red-800 ring-1 ring-red-200",
  Intern: "!bg-purple-100 !text-purple-800 ring-1 ring-purple-200",
  Fired: "!bg-orange-100 !text-orange-800 ring-1 ring-orange-200",
  DayOff: "!bg-gray-100 !text-gray-800 ring-1 ring-gray-200",
}

const SIZE: Record<NonNullable<DriverStatusBadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
  lg: "px-3 py-1 text-base",
}

export default function DriverStatusBadge({ status, size = "md" }: DriverStatusBadgeProps) {
  const label = LABELS[status] ?? "Неизвестно"
  const style = STYLES[status] ?? STYLES.DayOff
  const sizeClass = SIZE[size]

  return (
    <Badge
      // фиксируем прозрачный вариант, чтобы не перекрашивался темой
      variant="outline"
      className={cn("rounded-full font-medium", sizeClass, style)}
    >
      {label}
    </Badge>
  )
}
