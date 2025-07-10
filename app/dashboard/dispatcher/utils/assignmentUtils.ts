// assignmentUtils.ts
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"

// Отображение цвета, иконки и текста по статусу выхода
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

// Универсальный обработчик изменения отметки "вышел"
export async function handleCheckboxChange({
  assignment,
  checked,
  updateFn,
  rollbackFn,
}: {
  assignment: {
    dispatchBusLineId: string
    status: DispatchBusLineStatus
  }
  checked: boolean
  updateFn: (newStatus: DispatchBusLineStatus, isReleased: boolean, time: string) => void
  rollbackFn?: () => void
}) {
  const dispatchId = assignment.dispatchBusLineId
  const currentStatus = assignment.status

  let newStatus = currentStatus
  let newIsReleased = checked
  let newReleasedTime = checked ? new Date().toISOString().slice(11, 19) : ""

  if (checked) {
    if (currentStatus === DispatchBusLineStatus.Undefined) {
      newStatus = DispatchBusLineStatus.Released
    }
  } else {
    newIsReleased = false
    newReleasedTime = ""
    if (currentStatus === DispatchBusLineStatus.Released) {
      newStatus = DispatchBusLineStatus.Undefined
    }
  }

  try {
    await import("@/service/releasePlanService").then(({ releasePlanService }) =>
      releasePlanService.updateDispatchStatus(dispatchId, Number(newStatus), newIsReleased)
    )

    updateFn(newStatus, newIsReleased, newReleasedTime)
  } catch (err) {
    console.error("Ошибка обновления статуса:", err)
    rollbackFn?.()
  }
}
