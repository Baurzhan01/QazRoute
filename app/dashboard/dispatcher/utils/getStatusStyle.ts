import { DispatchBusLineStatus } from "@/types/releasePlanTypes"

export function getStatusStyle(status?: DispatchBusLineStatus) {
  switch (status) {
    case DispatchBusLineStatus.Released:
      return {
        color: "text-green-800",
        bg: "bg-green-50",
        label: "Вышел",
        icon: "🟩",
      }
    case DispatchBusLineStatus.Replaced:
      return {
        color: "text-yellow-700",
        bg: "bg-yellow-50",
        label: "Замена (резерв)",
        icon: "🟨",
      }
    case DispatchBusLineStatus.Permutation:
      return {
        color: "text-blue-800",
        bg: "bg-blue-50",
        label: "Перестановка",
        icon: "🟦",
      }
    case DispatchBusLineStatus.Removed:
      return {
        color: "text-red-700",
        bg: "bg-red-50",
        label: "Снят",
        icon: "🟥",
      }
    default:
      return {
        color: "text-gray-600",
        bg: "",
        label: "Не назначен",
        icon: "—",
      }
  }
}

