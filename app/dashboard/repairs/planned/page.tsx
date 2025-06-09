//главная страница для планирования ремонтов
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import AssignRepairDialog from "./components/AssignRepairDialog"
import RepairTable from "./components/RepairTable"
import { usePlannedRepairs } from "./hooks/usePlannedRepairs"
import { getAuthData } from "@/lib/auth-utils"

export default function PlannedRepairPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [assignModalOpen, setAssignModalOpen] = useState(false)

  const {
    repairs,
    isLoading,
    fetchRepairs,
    assignRepair,
    deleteRepair,
    updateRepair,
  } = usePlannedRepairs(selectedDate)

  const handleOpenAssignDialog = () => setAssignModalOpen(true)

  const handleAssignSaved = async () => {
    setAssignModalOpen(false)
    await fetchRepairs()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Плановый ремонт</h1>
          <p className="text-muted-foreground text-sm">
            Дата: {format(selectedDate, "PPP", { locale: ru })}
          </p>
        </div>
        <Button onClick={handleOpenAssignDialog}>
          <Plus className="h-4 w-4 mr-2" /> Назначить ремонт
        </Button>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className={cn("rounded-md border")}
        />
      </div>

      <RepairTable
        repairs={repairs}
        isLoading={isLoading}
        onDelete={deleteRepair}
        onUpdate={updateRepair}
        date={format(selectedDate, "yyyy-MM-dd")}
        convoyId={getAuthData()?.convoyId ?? ""}
        buses={[]}
        drivers={[]}
        onReload={fetchRepairs}
      />

      <AssignRepairDialog
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        date={selectedDate}
        onSaved={handleAssignSaved}
      />
    </div>
  )
}
