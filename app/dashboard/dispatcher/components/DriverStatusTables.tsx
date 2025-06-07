"use client"

import StatusTable from "./StatusTable"
import type { DriverStatus } from "@/types/driver.types"

interface DriverStatusTablesProps {
  date: string
  driverStatuses: Record<string, string[]>
  showDayOffDrivers: boolean
  toggleDayOffDrivers: () => void
}

export default function DriverStatusTables({
  date,
  driverStatuses,
  showDayOffDrivers,
  toggleDayOffDrivers,
}: DriverStatusTablesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-3 mt-3">
      <StatusTable
        title="👤 Водители на выходном"
        list={driverStatuses?.DayOff}
        date={date}
        colorClass="text-red-700"
        toggleShow={toggleDayOffDrivers}
        show={showDayOffDrivers}
      />
      <StatusTable
        title="🤒 Больничный"
        list={driverStatuses?.OnSickLeave}
        statusKey="OnSickLeave"
        colorClass="text-orange-700"
        date={date}
      />
      <StatusTable
        title="🏖️ Отпуск"
        list={driverStatuses?.OnVacation}
        statusKey="OnVacation"
        colorClass="text-yellow-700"
        date={date}
      />
      <StatusTable
        title="🧪 Стажёры"
        list={driverStatuses?.Intern}
        statusKey="Intern"
        colorClass="text-cyan-700"
        date={date}
      />
    </div>
  )
}
