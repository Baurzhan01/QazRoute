"use client"

import { useEffect, useState, useMemo } from "react"
import { InfoCell } from "./InfoCell"
import type { RouteAssignment } from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"
import DispatchHistoryModal from "./DispatchHistoryModal"
import { referenceService } from "@/service/referenceService"
import type { ReferenceDto } from "@/types/reference.types"

interface AssignmentCellProps {
  assignment: RouteAssignment
  date: Date
  readOnly: boolean
  textClassName?: string
  onUpdateLocalValue?: (value: string) => void
  /** локальный bump из таблицы, чтобы целево перезагрузить справки */
  refsVersion?: number
}

export default function AssignmentCell({
  assignment,
  date,
  readOnly,
  textClassName,
  onUpdateLocalValue,
  refsVersion = 0,
}: AssignmentCellProps) {
  const {
    additionalInfo,
    dispatchBusLineId,
    status,
    bus,
    driver,
    oldBus,
    oldDriver,
    replacementType,
  } = assignment as RouteAssignment & {
    oldBus?: { garageNumber?: string; stateNumber?: string }
    oldDriver?: { fullName?: string }
    replacementType?: string
  }

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLength, setHistoryLength] = useState(0)

  // ---- СПРАВКИ (Reference) ----
  const [refs, setRefs] = useState<ReferenceDto[]>([])
  const [refsLoading, setRefsLoading] = useState(false)

  const fetchReferences = async () => {
    try {
      setRefsLoading(true)
      const res = await referenceService.getByDispatchBusLine(dispatchBusLineId)
      if (res.isSuccess && Array.isArray(res.value)) {
        setRefs(res.value)
      } else {
        setRefs([])
      }
    } catch {
      setRefs([])
    } finally {
      setRefsLoading(false)
    }
  }

  useEffect(() => {
    fetchReferences()
  }, [dispatchBusLineId, refsVersion])

  // автообновление после ReferenceDialog через событие
  useEffect(() => {
    const handler = (e: any) => {
      const id = e?.detail?.dispatchBusLineId
      if (id && id === dispatchBusLineId) fetchReferences()
    }
    window.addEventListener("reference:created", handler as EventListener)
    return () => window.removeEventListener("reference:created", handler as EventListener)
  }, [dispatchBusLineId])

  // лейблы/иконки
  const REF_LABEL: Record<string, string> = {
    FamilyReason: "По семейным обстоятельствам",
    SickByCall: "Болезнь по звонку",
    PoliceCallBeforeDeparture: "Звонок 102 (до выезда)",
    GasStationIssue: "АЗС/пробки/колонка",
    PoliceOperation: "ОПМ (проверка ГАИ)",
    AccidentInDepot: "ДТП в парке",
    DriverLate: "Опоздание водителя",
    TechnicalIssue: "Тех. неисправность",
    AlcoholIntoxication: "Алкоинтоксикация",
    NoCharge: "Нет зарядки",
    EmergencyInDepot: "ЧС в парке",
    Other: "Другое",
  }
  const REF_ICON: Record<string, string> = {
    FamilyReason: "👪",
    SickByCall: "🤒",
    PoliceCallBeforeDeparture: "🚓",
    GasStationIssue: "⛽",
    PoliceOperation: "🚨",
    AccidentInDepot: "🚌💥",
    DriverLate: "⏰",
    TechnicalIssue: "🛠️",
    AlcoholIntoxication: "🍺",
    NoCharge: "🔋",
    EmergencyInDepot: "🆘",
    Other: "🧾",
  }

  const sortedRefs = useMemo(
    () => [...refs].sort((a, b) => (b.id || "").localeCompare(a.id || "")),
    [refs]
  )

  // Строим сводку справок для строки "Доп. информация"
  const referenceSummary = useMemo(() => {
    if (!sortedRefs.length) return ""
    return sortedRefs
      .map((r) => {
        const label = REF_LABEL[r.type as keyof typeof REF_LABEL] || String(r.type)
        const icon = REF_ICON[r.type as keyof typeof REF_ICON] || "🧾"
        const isOther = (r.type as string) === "Other"
        const desc = isOther && r.description ? `: ${r.description}` : ""
        return `${icon} ${label}${desc}`
      })
      .join(" | ")
  }, [sortedRefs])

  const handleInfoFromHistory = (text: string) => {
    onUpdateLocalValue?.(text)
  }

  const handleInfoFromHistoryModal = ({
    text,
    exited,
    historyCount,
  }: {
    text: string
    exited: boolean
    historyCount: number
  }) => {
    onUpdateLocalValue?.(text)
    setHistoryLength(historyCount)
  }

  const showReplacement = status === 2 || replacementType === "Replaced"
  const showPermutation = status === 3 || replacementType === "Permutation"
  const showRearrangingRoute = status === DispatchBusLineStatus.RearrangingRoute
  const showGarageLaunch = status === DispatchBusLineStatus.LaunchedFromGarage

  const formatInitials = (fullName?: string) => {
    if (!fullName) return ""
    const [last, first, middle] = fullName.split(" ")
    const initials = [first?.[0], middle?.[0]].filter(Boolean).join(".")
    return `${last} ${initials}.`
  }

  const permutationInfo = () => {
    const oldBusText = oldBus?.garageNumber ? `🚌 ${oldBus.garageNumber} → ${bus?.garageNumber}` : ""
    const oldDriverText = oldDriver?.fullName
      ? `👤 ${formatInitials(oldDriver.fullName)} → ${formatInitials(driver?.fullName || "")}`
      : ""
    return [oldBusText, oldDriverText].filter(Boolean).join(" · ")
  }

  return (
    <>
      <div className="flex flex-col leading-tight">
        {/* Основной текст + сводка Справок (externalNote) */}
        <InfoCell
          key={`${assignment.dispatchBusLineId}-${(refsVersion ?? 0)}-${assignment.additionalInfo ?? ""}`}
          initialValue={additionalInfo ?? ""}
          assignmentId={dispatchBusLineId}
          date={date}
          type="route"
          busId={bus?.id ?? null}
          driverId={driver?.id ?? null}
          textClassName={textClassName}
          readOnly={readOnly}
          onUpdateLocalValue={handleInfoFromHistory}
          externalNote={referenceSummary}
        />

        {(historyLength > 0 || showGarageLaunch) && (
          <button
            onClick={() => setHistoryOpen(true)}
            className="text-xs text-sky-600 underline mt-1"
          >
            Журнал событий
          </button>
        )}

        {showReplacement && (
          <span className="text-yellow-600 text-xs mt-1 italic">🔁 Замена с резерва</span>
        )}
        {showPermutation && (
          <span className="text-blue-600 text-xs mt-1 italic">
            🔄 Перестановка: {permutationInfo()}
          </span>
        )}
        {showRearrangingRoute && (
          <span className="text-blue-600 text-xs mt-1 italic">
            🔄 Перестановка по маршруту: {permutationInfo()}
          </span>
        )}
      </div>

      <DispatchHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        dispatchId={dispatchBusLineId}
        onSetInfo={({ text, exited, historyCount }) =>
          handleInfoFromHistoryModal({ text, exited, historyCount })
        }
        setHistoryLength={setHistoryLength}
      />
    </>
  )
}
