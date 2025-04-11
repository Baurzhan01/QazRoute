import { Bus, Wrench, AlertTriangle, Clock, XCircle } from "lucide-react"
import type { BusStatus } from "@/types/bus.types"

export function getBusStatusLabel(status: BusStatus): string {
  switch (status) {
    case "OnWork":
      return "На линии"
    case "UnderRepair":
      return "На ремонте"
    case "LongTermRepair":
      return "Длительный ремонт"
    case "DayOff":
      return "Выходной"
    case "Decommissioned":
      return "Списан"
    default:
      return "Неизвестный статус"
  }
}

export function getBusStatusInfo(status: BusStatus) {
  switch (status) {
    case "OnWork":
      return {
        label: "На линии",
        icon: Bus,
        color: {
          bg: "bg-green-100",
          text: "text-green-700",
        },
      }
    case "UnderRepair":
      return {
        label: "На ремонте",
        icon: Wrench,
        color: {
          bg: "bg-amber-100",
          text: "text-amber-700",
        },
      }
    case "LongTermRepair":
      return {
        label: "Длительный ремонт",
        icon: AlertTriangle,
        color: {
          bg: "bg-red-100",
          text: "text-red-700",
        },
      }
    case "DayOff":
      return {
        label: "Выходной",
        icon: Clock,
        color: {
          bg: "bg-purple-100",
          text: "text-purple-700",
        },
      }
    case "Decommissioned":
      return {
        label: "Списан",
        icon: XCircle,
        color: {
          bg: "bg-gray-100",
          text: "text-gray-700",
        },
      }
    default:
      return {
        label: "Неизвестный статус",
        icon: Bus,
        color: {
          bg: "bg-gray-100",
          text: "text-gray-700",
        },
      }
  }
}

