import { useState } from "react"
import { Button } from "@/components/ui/button"
import FinishUnplannedRepairModal from "./FinishUnplannedRepairModal"

interface UnscheduledRepairTableProps {
  repairs: any[]
  onRefresh?: () => void
}

function shortenName(fullName: string): string {
  const parts = fullName.split(" ")
  if (parts.length < 3) return fullName
  return `${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`
}

export default function UnscheduledRepairTable({
  repairs,
  onRefresh,
}: UnscheduledRepairTableProps) {
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null)
  const [modalDate, setModalDate] = useState<Date>(new Date())
  const [showModal, setShowModal] = useState(false)

  const handleOpenModal = (repair: any) => {
    setSelectedRepairId(repair.id)
    setModalDate(new Date(repair.startDate))
    setShowModal(true)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">№</th>
            <th className="p-2 border">Автоколонна</th>
            <th className="p-2 border">Маршрут / Выход</th>
            <th className="p-2 border">ФИО водителя</th>
            <th className="p-2 border">Гос. № (Гаражный №)</th>
            <th className="p-2 border">Причина</th>
            <th className="p-2 border">Начало</th>
            <th className="p-2 border">Окончание</th>
            <th className="p-2 border">Дата окончания</th>
            <th className="p-2 border">Время выезда</th>
            <th className="p-2 border">Пробег</th>
            <th className="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r, idx) => (
            <tr key={r.id} className={`border ${r.andTime ? "bg-green-100" : ""}`}>
              <td className="p-2 border text-center">{idx + 1}</td>
              <td className="p-2 border text-center">
                {typeof r.convoy?.number !== "undefined" ? `№${r.convoy.number}` : "-"}
              </td>
              <td className="p-2 border text-center">
                {r.route?.routeNumber ?? r.route?.number ?? "-"}
              </td>
              <td className="p-2 border">
                {r.driver?.fullName
                  ? `${shortenName(r.driver.fullName)} (${r.driver.serviceNumber})`
                  : "-"}
              </td>
              <td className="p-2 border text-center">
                {r.bus?.govNumber && r.bus?.garageNumber
                  ? `${r.bus.govNumber} (${r.bus.garageNumber})`
                  : "-"}
              </td>
              <td className="p-2 border text-red-600 font-medium">{r.text}</td>
              <td className="p-2 border text-center">{r.startTime || "-"}</td>
              <td className="p-2 border text-center">{r.andTime || "-"}</td>
              <td className="p-2 border text-center">{r.andDate || "-"}</td>
              <td className="p-2 border text-center">{r.exitTime || "-"}</td>
              <td className="p-2 border text-center">{r.mileage || "—"}</td>
              <td className="p-2 border text-center">
                {!r.andTime && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenModal(r)}
                  >
                    Завершить
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedRepairId && (
        <FinishUnplannedRepairModal
          open={showModal}
          onClose={() => setShowModal(false)}
          repairId={selectedRepairId}
          date={modalDate}
          onSuccess={() => {
            setShowModal(false)
            onRefresh?.()
          }}
        />
      )}
    </div>
  )
}
