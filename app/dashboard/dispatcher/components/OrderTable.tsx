"use client"

import { useEffect, useMemo, useState } from "react"
import { useConvoy } from "../context/ConvoyContext"
import { InfoCell } from "./InfoCell"
import { releasePlanService } from "@/service/releasePlanService"
import type { OrderAssignment } from "@/types/releasePlanTypes"
import { formatShortName } from "../convoy/[id]/release-plan/utils/driverUtils"
import { toast } from "@/components/ui/use-toast"

type ExtendedOrder = OrderAssignment & { time?: string }

interface OrderTableProps {
  orders: ExtendedOrder[]
  displayDate: Date
  readOnly?: boolean
  fuelNorms: Record<string, string>
  setFuelNorms: React.Dispatch<React.SetStateAction<Record<string, string>>>
  search?: string
}

export default function OrderTable({
  orders,
  displayDate,
  readOnly = false,
  fuelNorms,
  setFuelNorms,
  search = "",
}: OrderTableProps) {
  const { convoyId } = useConvoy()
  const [releasedTimes, setReleasedTimes] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const res = await releasePlanService.getReserveAssignmentsByDate(
          displayDate.toISOString().slice(0, 10),
          convoyId ?? "",
          "Order"
        )
        if (res.isSuccess && res.value) {
          const map: Record<string, string> = {}
          res.value.forEach((r) => {
            if (r.time && r.time !== "00:00:00") {
              map[r.id] = r.time
            }
          })
          setReleasedTimes(map)
        }
      } catch (err) {
        console.error("Ошибка получения времени выхода заказов", err)
      }
    }

    fetchTimes()
  }, [displayDate, convoyId])

  const filteredOrders = useMemo(() => {
    return orders.filter((r) => {
      const fullName = r.driver?.fullName?.toLowerCase() || ""
      const tabNumber = r.driver?.serviceNumber || ""
      return (
        !search ||
        fullName.includes(search.toLowerCase()) ||
        tabNumber.includes(search)
      )
    })
  }, [orders, search])

  const handleCheckboxChange = async (orderId: string, checked: boolean) => {
    const now = new Date()
    const newTime = checked
      ? now.toLocaleTimeString("ru-RU", { hour12: false }).slice(0, 8)
      : "00:00:00"
  
    try {
      await releasePlanService.markOrderAsReleased(orderId, checked ? newTime : null)
      setReleasedTimes((prev) => ({ ...prev, [orderId]: checked ? newTime : "" }))
      toast({
        title: "Успешно",
        description: checked ? `Время выхода: ${newTime}` : "Отметка снята",
      })
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить время выхода",
        variant: "destructive",
      })
    }
  }
  

  const headerClass = "p-2 border text-center bg-lime-100 text-black text-sm font-semibold"
  const cellClass = "p-2 border text-center text-sm"

  if (!filteredOrders.length) return null

  return (
    <div className="overflow-auto rounded-md border print-export mt-6">
      <table className="w-full text-sm text-gray-800 border-collapse">
        <thead>
          <tr>
            <th className={headerClass}>Заказ</th>
            <th className={headerClass}>№</th>
            <th className={headerClass}>Гар. номер</th>
            <th className={headerClass}>Гос. номер</th>
            <th className={headerClass}>ФИО</th>
            <th className={headerClass}>Таб. номер</th>
            <th className={headerClass}>Норма (л)</th>
            <th className={headerClass}>Время выхода</th>
            <th className={headerClass}>Доп. информация</th>
            <th className={headerClass}>Отметка</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((r, i) => {
            const key = r.id ?? `order-${i}`
            const released = releasedTimes[key]
            const isChecked = !!released && released !== "00:00:00"

            return (
              <tr key={key} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                {i === 0 && (
                  <td
                    className="p-2 border text-center font-bold text-black bg-lime-300 special-order-bg"
                    rowSpan={filteredOrders.length}
                    style={{ minWidth: "80px", verticalAlign: "middle" }}
                  >
                    ЗАКАЗ
                  </td>
                )}
                <td className={cellClass}>{r.sequenceNumber || i + 1}</td>
                <td className={cellClass}>{r.garageNumber || "—"}</td>
                <td className={cellClass}>{r.govNumber || "—"}</td>
                <td className={cellClass}>{formatShortName(r.driver?.fullName || "—")}</td>
                <td className={cellClass}>{r.driver?.serviceNumber || "—"}</td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={fuelNorms[key] ?? ""}
                    onChange={(e) =>
                      setFuelNorms((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-16 text-center text-red-600 font-semibold border border-red-300 rounded px-1 py-[2px] outline-none focus:ring-1 focus:ring-red-400"
                    placeholder="—"
                    disabled={readOnly}
                  />
                </td>
                <td className={cellClass}>
                    <div>{r.scheduleTime && r.scheduleTime !== "—" ? r.scheduleTime : "—"}</div>
                    {isChecked && released && released !== "00:00:00" && (
                        <div className="text-[11px] text-green-600 mt-0.5">
                        {released?.includes("T")
                          ? released.split("T")[1]?.slice(0, 5)
                          : released.slice(0, 5)} — путевой лист
                      </div>                      
                    )}
                    </td>
                <td className={cellClass}>
                  <InfoCell
                    initialValue={r.additionalInfo ?? ""}
                    assignmentId={r.id ?? ""}
                    date={displayDate}
                    type="order"
                    busId={r.busId ?? null}
                    driverId={r.driver?.id ?? null}
                    textClassName="text-red-600 font-semibold"
                    readOnly={readOnly}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="checkbox"
                    checked={!!isChecked}
                    onChange={(e) => handleCheckboxChange(r.id, e.target.checked)}
                    disabled={readOnly}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
