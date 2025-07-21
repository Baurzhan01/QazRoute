// ReplaceAssignmentModal/StatusBanner.tsx
import type { DisplayBus } from "@/types/bus.types"
import type { DisplayDriver } from "@/types/driver.types"

interface Props {
  selectedDriver: DisplayDriver | null
  selectedBus: DisplayBus | null
  currentTab: string
}

const tabStatusMap: Record<string, { text: string; style: string }> = {
  reserve: {
    text: "🔁 Выбрана замена из резерва",
    style: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  orders: {
    text: "📦 Замена с заказа",
    style: "bg-pink-100 text-pink-800 border-pink-300",
  },
  repairs: {
    text: "🔧 Замена с планового ремонта",
    style: "bg-amber-100 text-amber-800 border-amber-300",
  },
  assignments: {
    text: "📍 Перестановка с другого маршрута",
    style: "bg-purple-100 text-purple-800 border-purple-300",
  },
  buses: {
    text: "🔄 Перестановка (автобус)",
    style: "bg-blue-100 text-blue-700 border-blue-300",
  },
  drivers: {
    text: "🔄 Перестановка (водитель)",
    style: "bg-blue-100 text-blue-700 border-blue-300",
  },
}

export default function StatusBanner({ selectedDriver, selectedBus, currentTab }: Props) {
  if (!selectedDriver && !selectedBus) return null

  const { text, style } = tabStatusMap[currentTab] || {
    text: "🔄 Перестановка",
    style: "bg-blue-100 text-blue-700 border-blue-300",
  }

  return (
    <div className={`mt-2 rounded px-3 py-1 text-sm font-medium w-fit border ${style}`}>
      {text}
    </div>
  )
}
