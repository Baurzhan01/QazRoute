"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRangePicker } from "../../../repairs/misc/components/DateRangePicker"
import { MultiRepairTypeSelect } from "./MultiRepairTypeSelect"
import { RepairTypeTable } from "./RepairTypeTable"
import { routeExitRepairService } from "@/service/routeExitRepairService"
import { convoyService } from "@/service/convoyService"
import { getAuthData } from "@/lib/auth-utils"
import { downloadExcel } from "@/lib/excel/exportExcel"
import type {
  RouteExitRepairDto,
  RouteExitRepairStatus,
} from "@/types/routeExitRepair.types"
import { motion, AnimatePresence } from "framer-motion"
import { repairTypeLabels } from "@/app/constants/repairTypeLabels"

const normalizeRepairType = (type: string): RouteExitRepairStatus | null => {
  const t = type.trim().toLowerCase()
  switch (t) {
    case "unscheduled":
      return "Unscheduled"
    case "other":
      return "Other"
    case "longterm":
      return "LongTerm"
    default:
      return null
  }
}

export default function AllRepairsReportPage() {
  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())
  const [convoys, setConvoys] = useState<{ id: string; number: number }[]>([])
  const [selectedConvoyId, setSelectedConvoyId] = useState("all")
  const [selectedRepairTypes, setSelectedRepairTypes] = useState<RouteExitRepairStatus[]>([
    "Unscheduled",
    "Other",
    "LongTerm",
  ])
  const [loading, setLoading] = useState(false)
  const [repairs, setRepairs] = useState<RouteExitRepairDto[]>([])
  const depotId = getAuthData()?.busDepotId

  useEffect(() => {
    if (!depotId) return
    convoyService.getByDepotId(depotId).then((res) => {
      if (res.isSuccess && res.value) {
        setConvoys(res.value)
      }
    })
  }, [depotId])

  const handleFetch = async () => {
    if (!depotId) return
    setLoading(true)

    const response = await routeExitRepairService.filter({
      startDate: format(fromDate, "yyyy-MM-dd"),
      endDate: format(toDate, "yyyy-MM-dd"),
      depotId: String(depotId),
      repairTypes: selectedRepairTypes,
      ...(selectedConvoyId !== "all" && { convoyId: selectedConvoyId }),
    })

    if (response.isSuccess && Array.isArray(response.value)) {
      setRepairs(response.value)
    } else {
      setRepairs([])
    }

    setLoading(false)
  }

  const exportToExcel = () => {
    const rows = repairs.map((r) => ({
      "Гос. номер": r.bus?.govNumber,
      "Гаражный номер": r.bus?.garageNumber,
      Марка: r.bus?.brand || "—",
      VIN: r.bus?.vinCode || "—",
      Техпаспорт: r.bus?.dataSheetNumber || "—",
      Автоколонна: r.convoy?.number ? `№${r.convoy.number}` : "—",
      "Тип ремонта": repairTypeLabels[normalizeRepairType(r.repairType) ?? "Other"],
      Причина: r.text || "—",
      Начало: `${r.startDate} ${r.startTime?.slice(0, 5)}`,
      Окончание: r.endRepairDate
        ? `${r.endRepairDate} ${r.endRepairTime?.slice(0, 5)}`
        : "—",
    }))

    downloadExcel(rows, `Отчет_все_ремонты_${format(fromDate, "yyyy-MM-dd")}`)
  }

  const groupedByType: Record<RouteExitRepairStatus, RouteExitRepairDto[]> = {
    Unscheduled: [],
    Other: [],
    LongTerm: [],
  }

  for (const repair of repairs) {
    const normType = normalizeRepairType(repair.repairType)
    if (normType) {
      groupedByType[normType].push(repair)
    } else {
      console.warn("⚠️ Неизвестный тип ремонта:", repair.repairType)
    }
  }

  const normalizedSelectedTypes = selectedRepairTypes
    .map(normalizeRepairType)
    .filter((t): t is RouteExitRepairStatus => !!t)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-sky-700">Все ремонты (по типам)</h1>

      <div className="flex flex-wrap items-end gap-6">
        <DateRangePicker from={fromDate} to={toDate} onFromChange={setFromDate} onToChange={setToDate} />

        <Select value={selectedConvoyId} onValueChange={setSelectedConvoyId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Выберите колонну" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все колонны</SelectItem>
            {convoys.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                №{c.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <MultiRepairTypeSelect
          value={selectedRepairTypes}
          onChange={setSelectedRepairTypes}
        />

        <Button onClick={handleFetch}>Получить отчёт</Button>
        <Button
          onClick={exportToExcel}
          disabled={repairs.length === 0}
          variant="outline"
        >
          Экспорт в Excel
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Найдено записей: <strong>{repairs.length}</strong>
      </p>

      <AnimatePresence>
        {normalizedSelectedTypes.map((type) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <RepairTypeTable
              type={type}
              items={groupedByType[type] ?? []}
              label={repairTypeLabels[type]}
              loading={loading}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
