// ReplaceAssignmentModal.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { useState, useEffect, useMemo } from "react"
import { handleReplaceConfirm } from "./ReplaceAssignmentModal/handleReplaceConfirm"
import { busService } from "@/service/busService"
import { driverService } from "@/service/driverService"
import AutocompleteInput from "../components/ui/AutocompleteInput"
import { getAuthData } from "@/lib/auth-utils"

interface ReplaceAssignmentModalProps {
  open: boolean
  onClose: () => void
  selectedAssignment: any
  date: string
  depotId?: string
  onReload?: () => void
  onReplaceSuccess?: (updated: any) => void
}

const typeColorMap: Record<string, string> = {
  Replaced: "bg-yellow-100 text-yellow-800",
  Order: "bg-blue-100 text-blue-800",
  RearrangementRenovation: "bg-purple-100 text-purple-800",
  RearrangingRoute: "bg-orange-100 text-orange-800",
  Permutation: "bg-green-100 text-green-800",
}

const typeLabelMap: Record<string, string> = {
  Replaced: "Замена с резерва",
  Order: "С заказа",
  RearrangementRenovation: "С планового ремонта",
  RearrangingRoute: "Перестановка по маршруту",
  Permutation: "Перестановка",
}

function formatShortFIO(fullName?: string) {
  if (!fullName) return "—"
  const [last, first, middle] = fullName.split(" ")
  const initials = [first?.[0], middle?.[0]].filter(Boolean).join(".")
  return `${last} ${initials}.`
}

export default function ReplaceAssignmentModal({
  open,
  onClose,
  selectedAssignment,
  date,
  depotId,
  onReload,
  onReplaceSuccess,
}: ReplaceAssignmentModalProps) {
  const depot = depotId || getAuthData()?.busDepotId

  const [drivers, setDrivers] = useState<any[]>([])
  const [buses, setBuses] = useState<any[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string>("")
  const [selectedBusId, setSelectedBusId] = useState<string>("")
  const [replacementType, setReplacementType] = useState<string>("Replaced")
  const [isSwap, setIsSwap] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!depot || !date) return

      try {
        const [driversRes, busesRes] = await Promise.all([
          driverService.getByDepotWithAssignments(depot, date),
          busService.getByDepotWithAssignments(depot, date),
        ])
        if (driversRes?.isSuccess) setDrivers(driversRes.value || [])
        if (busesRes?.isSuccess) setBuses(busesRes.value || [])
      } catch (err) {
        console.error("Ошибка загрузки данных:", err)
        toast({ title: "Ошибка загрузки кандидатов", variant: "destructive" })
      }
    }
    if (open) loadData()
  }, [open, depot, date])

  const selectedDriver = useMemo(() => drivers.find((d) => d.driverId === selectedDriverId), [selectedDriverId, drivers])
  const selectedBus = useMemo(() => buses.find((b) => b.busId === selectedBusId), [selectedBusId, buses])

  useEffect(() => {
    if (!selectedDriver && !selectedBus) return

    if (selectedDriver && selectedBus) {
      if (isDriverBusy || isBusBusy) {
        setReplacementType("Permutation")
      } else {
        setReplacementType("Replaced")
      }
    } else if (selectedDriver) {
      setReplacementType(isDriverBusy ? "Permutation" : "Replaced")
    } else if (selectedBus) {
      setReplacementType(isBusBusy ? "Permutation" : "Replaced")
    }
  }, [selectedDriver, selectedBus])

  useEffect(() => {
    if (!open) {
      setSelectedDriverId("")
      setSelectedBusId("")
      setReplacementType("Replaced")
      setIsSwap(false)
    }
  }, [open])


  const isDriverBusy = !!(selectedDriver?.routeName && selectedDriver?.busLineNumber)
  const isBusBusy = !!(selectedBus?.routeName && selectedBus?.busLineNumber)

  const getDriverDisplay = (d: any) => {
    const initials = d.fullName?.split(" ").map((part: string, i: number) => i === 0 ? part : part[0] + ".").join(" ")
    const suffix = d.serviceNumber ? `(${d.serviceNumber})` : ""
    const assignment = d.routeName && d.busLineNumber
      ? ` · Назначен: ${d.routeName} / выход ${d.busLineNumber}`
      : " · Свободен"
    return `${initials} ${suffix} · Колонна ${d.convoyNumber}${assignment}`
  }

  const getBusDisplay = (b: any) => {
    const assignment = b.routeName && b.busLineNumber
      ? ` · Назначен: ${b.routeName} / выход ${b.busLineNumber}`
      : " · Свободен"
    return `${b.garageNumber} / ${b.govNumber} · Колонна ${b.convoyNumber}${assignment}`
  }

  const handleConfirm = async () => {
    if (!selectedDriver && !selectedBus) {
      toast({ title: "Выберите водителя или автобус", variant: "destructive" })
      return
    }

    if (replacementType === "RearrangingRoute" && (!selectedDriver || !selectedBus)) {
      toast({ title: "Для перестановки по маршруту выберите и водителя, и автобус", variant: "destructive" })
      return
    }

    await handleReplaceConfirm({
      selectedAssignment,
      isFirstShift: true,
      selectedDriver: selectedDriver ? {
        id: selectedDriver.driverId,
        fullName: selectedDriver.fullName,
        serviceNumber: selectedDriver.serviceNumber,
        driverStatus: selectedDriver.status as any,
      } : null,
      selectedBus: selectedBus ? {
        id: selectedBus.busId,
        garageNumber: selectedBus.garageNumber,
        govNumber: selectedBus.govNumber,
        status: selectedBus.status,
      } : null,
      reserve: [],
      replacementType,
      date,
      onReplaceSuccess,
      onReload,
      onClose,
      swap: isSwap,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Замена на выходе</DialogTitle>
        </DialogHeader>

        {/* 🔎 Блок текущего назначения */}
        <div className="bg-muted p-3 rounded mb-4 text-sm space-y-1">
          <p>📍 <b>Маршрут:</b> {selectedAssignment.route?.name || selectedAssignment.routeName || "—"}</p>
          <p>🚌 <b>Выход:</b> {selectedAssignment.busLineNumber || "—"}</p>
          <p>👤 <b>Водитель:</b> {formatShortFIO(selectedAssignment.driver?.fullName)} ({selectedAssignment.driver?.serviceNumber || "—"})</p>
          <p>🚍 <b>Автобус:</b> {selectedAssignment.bus?.garageNumber} / {selectedAssignment.bus?.govNumber}</p>
        </div>

        <div className="mb-4">
          <AutocompleteInput
            label="Водитель"
            items={drivers}
            selectedId={selectedDriverId}
            onSelect={setSelectedDriverId}
            idKey="driverId"
            displayValue={getDriverDisplay}
          />
          {selectedDriver && (
            <p className="text-xs mt-1 text-gray-500">
              {isDriverBusy
                ? `🛣 Назначен на маршрут: ${selectedDriver.routeName} · выход: ${selectedDriver.busLineNumber}`
                : "✅ Свободен"}
            </p>
          )}
        </div>

        <div className="mb-4">
          <AutocompleteInput
            label="Автобус"
            items={buses}
            selectedId={selectedBusId}
            onSelect={setSelectedBusId}
            idKey="busId"
            displayValue={getBusDisplay}
          />
          {selectedBus && (
            <p className="text-xs mt-1 text-gray-500">
              {isBusBusy
                ? `🛣 Назначен на маршрут: ${selectedBus.routeName} · выход: ${selectedBus.busLineNumber}`
                : "✅ Свободен"}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Тип замены</label>
          <Select value={replacementType} onValueChange={setReplacementType}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип замены" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Replaced">Замена с резерва</SelectItem>
              <SelectItem value="Order">С заказа</SelectItem>
              <SelectItem value="RearrangementRenovation">С планового ремонта</SelectItem>
              <SelectItem value="RearrangingRoute">Перестановка по маршруту</SelectItem>
              <SelectItem value="Permutation">Перестановка</SelectItem>
            </SelectContent>
          </Select>
          <div className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${typeColorMap[replacementType]}`}>
            {typeLabelMap[replacementType] || replacementType}
          </div>
        </div>

        {replacementType === "RearrangingRoute" && (
          <div className="mb-4 flex items-center gap-2">
            <Checkbox checked={isSwap} onCheckedChange={(v) => setIsSwap(!!v)} disabled={!selectedDriver || !selectedBus} />
            <span className="text-sm text-muted-foreground">Поменять местами</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleConfirm}>Заменить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
