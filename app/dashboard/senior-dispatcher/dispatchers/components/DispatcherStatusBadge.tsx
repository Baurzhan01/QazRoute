import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import type { DispatcherStatus } from "../types/dispatcher.types"

interface DispatcherStatusBadgeProps {
  status: DispatcherStatus
}

export function DispatcherStatusBadge({ status }: DispatcherStatusBadgeProps) {
  const isBlocked = status === "blocked"

  return (
    <Badge
      className={`inline-flex items-center gap-1 ${
        isBlocked
          ? "bg-red-100 text-red-800 border-red-200"
          : "bg-green-100 text-green-800 border-green-200"
      }`}
    >
      {isBlocked ? (
        <XCircle className="h-4 w-4 text-red-600" />
      ) : (
        <CheckCircle className="h-4 w-4 text-green-600" />
      )}
      {isBlocked ? "Заблокирован" : "Активен"}
    </Badge>
  )
}
