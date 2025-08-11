// ReplaceAssignmentModal.tsx (замена всего файла)
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useMemo, useState } from "react"
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

type DriverRaw = {
  driverId: string; fullName: string; serviceNumber: string; status: string;
  routeName: string | null; busLineNumber: string | null; convoyNumber: string
}
type BusRaw = {
  busId: string; garageNumber: string; govNumber: string; status: string;
  routeName: string | null; busLineNumber: string | null; convoyNumber: string
}

type Option<T> = { id: string; label: string; search: string; raw: T }

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

  const [drivers, setDrivers] = useState<DriverRaw[]>([])
  const [buses, setBuses] = useState<BusRaw[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [selectedBusId, setSelectedBusId] = useState("")
  const [replacementType, setReplacementType] = useState<string>("Replaced")
  const [isSwap, setIsSwap] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // load candidates
  useEffect(() => {
    const loadData = async () => {
      if (!depot || !date) return
      try {
        const [dRes, bRes] = await Promise.all([
          driverService.getByDepotWithAssignments(depot, date),
          busService.getByDepotWithAssignments(depot, date),
        ])
        if (dRes?.isSuccess) setDrivers(dRes.value || [])
        if (bRes?.isSuccess) setBuses(bRes.value || [])
      } catch (e) {
        console.error("Ошибка загрузки кандидатов:", e)
        toast({ title: "Ошибка загрузки кандидатов", variant: "destructive" })
      }
    }
    if (open) loadData()
  }, [open, depot, date])

  // options prepared (fast)
  const driverOptions: Option<DriverRaw>[] = useMemo(
    () =>
      drivers.map((d) => {
        const fioParts = d.fullName.split(" ")
        const fio = fioParts
          .map((part, i) => (i === 0 ? part : (part[0] || "") + "."))
          .join(" ")
        const assign = d.routeName && d.busLineNumber ? ` · Назначен: ${d.routeName} / выход ${d.busLineNumber}` : " · Свободен"
        const label = `${fio} ${d.serviceNumber ? `(${d.serviceNumber})` : ""} · Колонна ${d.convoyNumber}${assign}`
        const search = `${d.fullName} ${d.serviceNumber || ""} ${d.routeName || ""} ${d.busLineNumber || ""} ${d.convoyNumber || ""}`.toLowerCase()
        return { id: d.driverId, label, search, raw: d }
      }),
    [drivers]
  )

  const busOptions: Option<BusRaw>[] = useMemo(
    () =>
      buses.map((b) => {
        const assign = b.routeName && b.busLineNumber ? ` · Назначен: ${b.routeName} / выход ${b.busLineNumber}` : " · Свободен"
        const label = `${b.garageNumber} / ${b.govNumber} · Колонна ${b.convoyNumber}${assign}`
        const search = `${b.garageNumber} ${b.govNumber} ${b.routeName || ""} ${b.busLineNumber || ""} ${b.convoyNumber || ""}`.toLowerCase()
        return { id: b.busId, label, search, raw: b }
      }),
    [buses]
  )

  const selectedDriverOpt = useMemo(
    () => driverOptions.find((o) => o.id === selectedDriverId),
    [driverOptions, selectedDriverId]
  )
  const selectedBusOpt = useMemo(
    () => busOptions.find((o) => o.id === selectedBusId),
    [busOptions, selectedBusId]
  )

  const isDriverBusy = !!(selectedDriverOpt?.raw.routeName && selectedDriverOpt?.raw.busLineNumber)
  const isBusBusy = !!(selectedBusOpt?.raw.routeName && selectedBusOpt?.raw.busLineNumber)

  // auto-type suggestion (compute busy flags inside)
  useEffect(() => {
    if (!selectedDriverOpt && !selectedBusOpt) return
    const dBusy = !!(selectedDriverOpt?.raw.routeName && selectedDriverOpt?.raw.busLineNumber)
    const bBusy = !!(selectedBusOpt?.raw.routeName && selectedBusOpt?.raw.busLineNumber)

    if (selectedDriverOpt && selectedBusOpt) {
      setReplacementType(dBusy || bBusy ? "Permutation" : "Replaced")
    } else if (selectedDriverOpt) {
      setReplacementType(dBusy ? "Permutation" : "Replaced")
    } else if (selectedBusOpt) {
      setReplacementType(bBusy ? "Permutation" : "Replaced")
    }
  }, [selectedDriverOpt, selectedBusOpt])

  // reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedDriverId("")
      setSelectedBusId("")
      setReplacementType("Replaced")
      setIsSwap(false)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!selectedDriverOpt && !selectedBusOpt) {
      toast({ title: "Выберите водителя или автобус", variant: "destructive" })
      return
    }
    if (replacementType === "RearrangingRoute" && (!selectedDriverOpt || !selectedBusOpt)) {
      toast({ title: "Для перестановки по маршруту выберите и водителя, и автобус", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      await handleReplaceConfirm({
        selectedAssignment,
        isFirstShift: true,
        selectedDriver: selectedDriverOpt
          ? {
              id: selectedDriverOpt.raw.driverId,
              fullName: selectedDriverOpt.raw.fullName,
              serviceNumber: selectedDriverOpt.raw.serviceNumber,
              driverStatus: selectedDriverOpt.raw.status as any,
            }
          : null,
        selectedBus: selectedBusOpt
          ? {
              id: selectedBusOpt.raw.busId,
              garageNumber: selectedBusOpt.raw.garageNumber,
              govNumber: selectedBusOpt.raw.govNumber,
              status: selectedBusOpt.raw.status,
            }
          : null,
        reserve: [],
        replacementType,
        date,
        onReplaceSuccess,
        onReload,
        onClose,
        swap: isSwap,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Замена на выходе</DialogTitle>
        </DialogHeader>

        {/* Инфо о текущем назначении */}
        <div className="bg-muted p-3 rounded mb-4 text-sm space-y-1">
          <p>📍 <b>Маршрут:</b> {selectedAssignment.route?.name || selectedAssignment.routeName || "—"}</p>
          <p>🚌 <b>Выход:</b> {selectedAssignment.busLineNumber || "—"}</p>
          <p>👤 <b>Водитель:</b> {formatShortFIO(selectedAssignment.driver?.fullName)} ({selectedAssignment.driver?.serviceNumber || "—"})</p>
          <p>🚍 <b>Автобус:</b> {selectedAssignment.bus?.garageNumber} / {selectedAssignment.bus?.govNumber}</p>
        </div>

        {/* Водитель */}
        <div className="mb-4">
          <AutocompleteInput<Option<DriverRaw>>
            label="Водитель"
            items={driverOptions}
            selectedId={selectedDriverId}
            onSelect={setSelectedDriverId}
            idKey="id"
            minChars={2}
            displayValue={(o) => o.label}
            searchValue={(o) => o.search}
          />
          {selectedDriverOpt && (
            <p className="text-xs mt-1 text-gray-500">
              {isDriverBusy
                ? `🛣 Назначен: ${selectedDriverOpt.raw.routeName} · выход: ${selectedDriverOpt.raw.busLineNumber}`
                : "✅ Свободен"}
            </p>
          )}
        </div>

        {/* Автобус */}
        <div className="mb-4">
          <AutocompleteInput<Option<BusRaw>>
            label="Автобус"
            items={busOptions}
            selectedId={selectedBusId}
            onSelect={setSelectedBusId}
            idKey="id"
            minChars={2}
            displayValue={(o) => o.label}
            searchValue={(o) => o.search}
          />
          {selectedBusOpt && (
            <p className="text-xs mt-1 text-gray-500">
              {isBusBusy
                ? `🛣 Назначен: ${selectedBusOpt.raw.routeName} · выход: ${selectedBusOpt.raw.busLineNumber}`
                : "✅ Свободен"}
            </p>
          )}
        </div>

        {/* Тип замены */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Тип замены</label>
          <Select value={replacementType} onValueChange={setReplacementType}>
            <SelectTrigger><SelectValue placeholder="Выберите тип замены" /></SelectTrigger>
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
            <Checkbox checked={isSwap} onCheckedChange={(v) => setIsSwap(!!v)} disabled={!selectedDriverOpt || !selectedBusOpt} />
            <span className="text-sm text-muted-foreground">Поменять местами</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleConfirm} disabled={submitting}>{submitting ? "Сохраняю..." : "Заменить"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
