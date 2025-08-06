"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

import { handleReplaceConfirm } from "./ReplaceAssignmentModal/handleReplaceConfirm"
import { useReplacementData, CandidateRow, BusRow } from "../hooks/useReplacementData"
import CandidateTable from "./ReplaceAssignmentModal/CandidateTable"
import BusTable from "./ReplaceAssignmentModal/BusTable"

interface Props {
  open: boolean
  onClose: () => void
  selectedAssignment: any
  date: string
  convoyId: string
  onReload?: () => void
  onReplaceSuccess?: (updated: any) => void
}

const replacementTypes = [
  { value: "Replaced", label: "Замена с резерва" },
  { value: "Order", label: "С заказа" },
  { value: "RearrangementRenovation", label: "С планового ремонта" },
  { value: "RearrangingRoute", label: "Перестановка по маршруту" },
  { value: "Permutation", label: "Перестановка" },
]

export default function ReplaceAssignmentModal({
  open,
  onClose,
  selectedAssignment,
  date,
  convoyId,
  onReload,
  onReplaceSuccess,
}: Props) {
  const { candidates, buses, loadData } = useReplacementData(date, convoyId)
  const [replacementType, setReplacementType] = useState("Replaced")
  const [swap, setSwap] = useState(false)
  const [searchCandidate, setSearchCandidate] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRow | null>(null)

  const [showBusList, setShowBusList] = useState(false)
  const [selectedBus, setSelectedBus] = useState<BusRow | null>(null)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

  const handleConfirmReplace = () => {
    if (!selectedCandidate) {
      toast({ title: "Выберите замену", variant: "destructive" })
      return
    }

    handleReplaceConfirm({
      selectedAssignment,
      isFirstShift: true,
      selectedBus: selectedCandidate?.bus || null,
      selectedDriver: selectedCandidate?.driver || null,
      reserve: [],
      replacementType,
      date,
      onReplaceSuccess,
      onReload,
      onClose,
      swap,
    } as any)
  }

  const handleConfirmBusReplace = () => {
    if (!selectedCandidate || !selectedBus) {
      toast({ title: "Выберите автобус", variant: "destructive" })
      return
    }

    handleReplaceConfirm({
      selectedAssignment: {...selectedCandidate,dispatchBusLineId: selectedCandidate.dispatchBusLineId,},
      isFirstShift: true,
      selectedBus: {
        id: selectedBus.id,
        garageNumber: selectedBus.garageNumber,
        govNumber: selectedBus.govNumber,
        status: selectedBus.status!,
      },
      selectedDriver: selectedCandidate.driver || null,
      reserve: [],
      replacementType: "Permutation",
      date,
      onReplaceSuccess: () => {
        setShowBusList(false)
        setSelectedBus(null)
        loadData()
      },
      onReload,
      onClose: () => {},
      swap: false,
    } as any)
  }

  const filteredCandidates = candidates.filter((c) => {
    const q = searchCandidate.toLowerCase()
    return (
      c.driver?.fullName?.toLowerCase().includes(q) ||
      c.driver?.serviceNumber?.toLowerCase().includes(q) ||
      c.bus?.garageNumber?.toLowerCase().includes(q) ||
      c.bus?.govNumber?.toLowerCase().includes(q) ||
      c.routeNumber?.toString().includes(q) ||
      c.exitNumber?.toString().includes(q)
    )
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-none rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Замена на выходе</DialogTitle>
        </DialogHeader>

        {/* Первая строка: тип замены + чекбокс */}
        <div className="flex items-center gap-2 mb-2">
          <Select value={replacementType} onValueChange={setReplacementType}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Тип замены" />
            </SelectTrigger>
            <SelectContent>
              {replacementTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {replacementType === "RearrangingRoute" && (
            <label className="flex items-center gap-1 whitespace-nowrap">
              <Checkbox checked={swap} onCheckedChange={(v) => setSwap(!!v)} />
              Поменять местами
            </label>
          )}
        </div>

        {/* Вторая строка: поиск кандидатов */}
        <div className="mb-3">
          <Input
            placeholder="Поиск кандидата..."
            value={searchCandidate}
            onChange={(e) => setSearchCandidate(e.target.value)}
          />
        </div>

        {/* Таблица кандидатов */}
        <CandidateTable
          candidates={filteredCandidates}
          selectedCandidate={selectedCandidate}
          onSelectCandidate={(c) => setSelectedCandidate(c)}
          onBusReplaceClick={(c) => {
            setSelectedCandidate(c)
            setShowBusList(true)
          }}
        />

        {/* Таблица автобусов (если замена автобуса) */}
        {showBusList && (
          <BusTable
            buses={buses}
            selectedBus={selectedBus}
            onSelectBus={(b) => setSelectedBus(b)}
            onConfirmReplace={handleConfirmBusReplace}
          />
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleConfirmReplace} disabled={!selectedCandidate}>
            Заменить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}