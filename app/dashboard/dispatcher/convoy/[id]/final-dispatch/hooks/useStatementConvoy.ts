import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { toast } from "@/components/ui/use-toast"

import { actionLogService } from "@/service/actionLogService"
import { convoyService } from "@/service/convoyService"
import { releasePlanService } from "@/service/releasePlanService"
import { statementsService } from "@/service/statementsService"
import { getAuthData } from "@/lib/auth-utils"
import { getDayTypeFromDate } from "@/app/dashboard/dispatcher/convoy/[id]/release-plan/utils/dateUtils"

import type { ActionLogStatus } from "@/types/actionLog.types"
import type { StatementBusLine } from "@/types/releasePlanTypes"

import { StatementAction, actionsByStatus, routeStatusMap } from "../utils/constants"
import {
  buildAssignmentPayload,
  buildStatementPayload,
  collectRemovedRows,
  findRowById,
  collectActionLogsFromBuckets,
  splitRoutes,
} from "../utils/helpers"
import type {
  DayType,
  EventLogModalState,
  ReplaceModalState,
  RouteBucket,
  StatementActionLog,
  StatementRow,
  StatusModalMode,
  StatusModalResult,
  StatusModalState,
} from "../types"

interface UseStatementConvoyParams {
  convoyId: string
}

const DEFAULT_ACTION_STATUS_BY_MODE: Record<StatusModalMode, ActionLogStatus> = {
  gotOff: "NotDriverFault",
  order: "Order",
  complete: "NotDriverFault",
  remove: "NotDriverFault",
}

export const useStatementConvoy = ({ convoyId }: UseStatementConvoyParams) => {
  const [date, setDate] = useState(() => new Date())
  const dateStr = useMemo(() => format(date, "yyyy-MM-dd"), [date])
  const prettyDate = useMemo(() => format(date, "d MMMM yyyy (EEEE)", { locale: ru }), [date])
  const dayType = useMemo<DayType>(() => getDayTypeFromDate(dateStr) as DayType, [dateStr])

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("Итоговая ведомость")
  const [convoyLabel, setConvoyLabel] = useState("")
  const [routes, setRoutes] = useState<RouteBucket[]>([])
  const [removedRows, setRemovedRows] = useState<StatementRow[]>([])
  const [orderLogs, setOrderLogs] = useState<StatementActionLog[]>([])
  const [removedLogs, setRemovedLogs] = useState<StatementActionLog[]>([])

  const [pendingInputs, setPendingInputs] = useState<Record<string, string>>({})
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({})
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const [replaceState, setReplaceState] = useState<ReplaceModalState>({ open: false, row: null })
  const [statusModalState, setStatusModalState] = useState<StatusModalState>({ open: false, mode: "gotOff", row: null })
  const [eventLogState, setEventLogState] = useState<EventLogModalState>({ open: false, row: null })
  const [statusSubmitting, setStatusSubmitting] = useState(false)

  const depotId = useMemo(() => getAuthData()?.busDepotId ?? "", [])
  const routesRef = useRef<RouteBucket[]>([])

  const syncRemoved = useCallback((buckets: RouteBucket[]) => {
    setRemovedRows(collectRemovedRows(buckets))
  }, [])

  const buildTitle = useCallback((label: string, targetDate: Date) => {
    const company = "Транспортное предприятие"
    const suffix = label ? ` (${label})` : ""
    return `Итоговая ведомость ${company}${suffix} на ${format(targetDate, "d MMMM yyyy", { locale: ru })}`
  }, [])

  const fetchData = useCallback(async () => {
    if (!convoyId) return
    setLoading(true)
    try {
      const [statementRes, summaryRes] = await Promise.all([
        releasePlanService.getFullStatementByDate(dateStr, convoyId, routeStatusMap[dayType]),
        convoyService.getConvoySummary(convoyId, dateStr).catch(() => null),
      ])

      const data = statementRes.value ?? null
      const buckets = splitRoutes(data?.routes ?? [])
      setRoutes(buckets)
      routesRef.current = buckets
      syncRemoved(buckets)
      setPendingInputs({})

      setOrderLogs(collectActionLogsFromBuckets(buckets, "onOrder"))
      setRemovedLogs(collectActionLogsFromBuckets(buckets, "removed"))

      const summary = summaryRes?.value ?? summaryRes ?? {}
      const label = summary?.convoyNumber
        ? `Автоколонна №${summary.convoyNumber}`
        : summary?.convoyName || ""
      setConvoyLabel(label)
      setTitle(buildTitle(label, date))

      if (data?.date) {
        const serverDate = new Date(data.date)
        if (!Number.isNaN(serverDate.getTime())) {
          const sameDay = serverDate.toISOString().slice(0, 10) === dateStr
          if (!sameDay) {
            setDate(serverDate)
          }
        }
      }
    } catch (error: any) {
      console.error("load statement error", error)
      toast({
        title: "Не удалось загрузить ведомость",
        description: error?.message || "Попробуйте обновить страницу",
        variant: "destructive",
      })
      setRoutes([])
      routesRef.current = []
      setRemovedRows([])
      setOrderLogs([])
      setRemovedLogs([])
    } finally {
      setLoading(false)
    }
  }, [buildTitle, convoyId, date, dateStr, dayType, syncRemoved])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    routesRef.current = routes
  }, [routes])

  useEffect(() => {
    setTitle(buildTitle(convoyLabel, date))
  }, [convoyLabel, date, buildTitle])

  useEffect(() => () => {
    Object.values(saveTimers.current).forEach(timer => clearTimeout(timer))
  }, [])

  const activeRoutes = useMemo(
    () =>
      routes
        .map(bucket => ({ ...bucket, rows: bucket.rows.filter(row => row.status !== "Rejected") }))
        .filter(bucket => bucket.rows.length > 0),
    [routes]
  )

  const patchRow = useCallback(
    (dispatchBusLineId: string, patch: Partial<StatementRow>, rawPatch?: Partial<StatementBusLine>) => {
      setRoutes(prev => {
        const next = prev.map(bucket => ({
          ...bucket,
          rows: bucket.rows.map(row => {
            if (row.dispatchBusLineId !== dispatchBusLineId) return row
            const nextRaw = { ...row.raw, ...(rawPatch ?? {}) }
            return {
              ...row,
              ...patch,
              raw: nextRaw,
            }
          }),
        }))
        routesRef.current = next
        syncRemoved(next)
        return next
      })
    },
    [syncRemoved]
  )

  const applyAutoSave = useCallback(
    async (dispatchBusLineId: string, rawValue: string) => {
      const row = findRowById(routesRef.current, dispatchBusLineId)
      if (!row) return
      if (!row.statementId) {
        toast({
          title: "Нет связанной ведомости",
          description: "Сначала сформируйте итоговую ведомость для этого выхода.",
          variant: "destructive",
        })
        return
      }

      const trimmed = rawValue.trim()
      const normalized = trimmed === "" ? null : Number(trimmed.replace(",", "."))
      if (normalized !== null && Number.isNaN(normalized)) {
        toast({ title: "Некорректное значение", description: "Введите число", variant: "destructive" })
        return
      }

      setSavingRows(prev => ({ ...prev, [dispatchBusLineId]: true }))
      try {
        const payload = buildStatementPayload(row, {
          driversRevolutions: normalized,
          spokenRevolutions: normalized,
        })
        await statementsService.update(row.statementId, payload)
        patchRow(
          dispatchBusLineId,
          { spokenRevolutions: normalized },
          { revolutions: normalized ?? row.raw.revolutions }
        )
        setPendingInputs(prev => {
          const next = { ...prev }
          if (normalized === null) delete next[dispatchBusLineId]
          else next[dispatchBusLineId] = String(normalized)
          return next
        })
      } catch (error: any) {
        console.error("auto save spoken error", error)
        toast({
          title: "Не удалось сохранить",
          description: error?.message || "Попробуйте еще раз",
          variant: "destructive",
        })
      } finally {
        setSavingRows(prev => ({ ...prev, [dispatchBusLineId]: false }))
      }
    },
    [patchRow]
  )

  const scheduleAutoSave = useCallback(
    (dispatchBusLineId: string, value: string) => {
      setPendingInputs(prev => ({ ...prev, [dispatchBusLineId]: value }))
      if (saveTimers.current[dispatchBusLineId]) {
        clearTimeout(saveTimers.current[dispatchBusLineId])
      }
      saveTimers.current[dispatchBusLineId] = setTimeout(() => {
        void applyAutoSave(dispatchBusLineId, value)
      }, 1000)
    },
    [applyAutoSave]
  )

  const openReplaceModal = useCallback((row: StatementRow) => {
    setReplaceState({ open: true, row })
  }, [])

  const closeReplaceModal = useCallback(() => {
    setReplaceState({ open: false, row: null })
  }, [])

  const openStatusModal = useCallback((mode: StatusModalMode, row: StatementRow) => {
    setStatusModalState({ open: true, mode, row })
  }, [])

  const closeStatusModal = useCallback(() => {
    setStatusModalState(prev => ({ ...prev, open: false, row: null }))
  }, [])

  const openLogModal = useCallback((row: StatementRow) => {
    setEventLogState({ open: true, row })
  }, [])

  const closeLogModal = useCallback(() => {
    setEventLogState({ open: false, row: null })
  }, [])

  const handleReturnToLine = useCallback(
    async (row: StatementRow) => {
      if (!row.statementId) {
        toast({ title: "Нет statementId", description: "Нельзя обновить статус", variant: "destructive" })
        return
      }

      setStatusSubmitting(true)
      try {
        const payload = buildStatementPayload(row, { status: "OnWork" })
        await statementsService.update(row.statementId, payload)
        patchRow(row.dispatchBusLineId, { status: "OnWork" }, { status: "OnWork" })
        toast({ title: "Выход возвращён на линию" })
      } catch (error: any) {
        console.error("return to line error", error)
        toast({
          title: "Не удалось обновить статус",
          description: error?.message || "Попробуйте еще раз",
          variant: "destructive",
        })
      } finally {
        setStatusSubmitting(false)
      }
    },
    [patchRow]
  )

  const handleStatusSubmit = useCallback(
    async (result: StatusModalResult) => {
      const row = statusModalState.row
      const mode = statusModalState.mode
      if (!row) return
      if (!row.statementId) {
        toast({ title: "��� statementId", description: "����� �������� �����", variant: "destructive" })
        return
      }

      setStatusSubmitting(true)
      try {
        const now = new Date()
        const normalizedRevolutions =
          result.revolutionCount ?? row.spokenRevolutions ?? 0

        const rawDescription =
          (mode === "order" ? result.orderDescription : result.comment) ?? null
        const description = rawDescription?.trim() ? rawDescription.trim() : null

        const actionStatus =
          result.reason ?? DEFAULT_ACTION_STATUS_BY_MODE[mode] ?? result.status

        await actionLogService.create({
          statementId: row.statementId,
          time: format(now, "HH:mm:ss"),
          driverId: row.driverId ?? null,
          busId: row.busId ?? null,
          revolutionCount: normalizedRevolutions,
          description,
          statementStatus: result.status,
          actionStatus,
        })
        toast({
          title: "����⨥ ���������",
          description: "������ �ᯥ譮 ᮧ���� � ��ୠ�� ᮡ�⨩.",
        })

        await fetchData()

        closeStatusModal()
      } catch (error: any) {
        console.error("action log create error", error)
        toast({
          title: "�訡�� �� ���������� ᮡ���",
          description: error?.message || "���஡�� ᭮��",
          variant: "destructive",
        })
      } finally {
        setStatusSubmitting(false)
      }
    },
    [fetchData, closeStatusModal, statusModalState.mode, statusModalState.row]
  )

  

  const handleStatementAction = useCallback(
    (action: StatementAction, row: StatementRow) => {
      switch (action) {
        case StatementAction.Replace:
          openReplaceModal(row)
          break
        case StatementAction.ReportGotOff:
          openStatusModal("gotOff", row)
          break
        case StatementAction.SendToOrder:
          openStatusModal("order", row)
          break
        case StatementAction.Complete:
          openStatusModal("complete", row)
          break
        case StatementAction.Remove:
          openStatusModal("remove", row)
          break
        case StatementAction.ReturnToLine:
          void handleReturnToLine(row)
          break
        case StatementAction.ViewLog:
          openLogModal(row)
          break
      }
    },
    [handleReturnToLine, openLogModal, openReplaceModal, openStatusModal]
  )

  const selectedAssignment = replaceState.row ? buildAssignmentPayload(replaceState.row) : null

  return {
    date,
    setDate,
    dateStr,
    prettyDate,
    dayType,
    loading,
    title,
    convoyLabel,
    routes,
    activeRoutes,
    removedRows,
    orderLogs,
    removedLogs,
    pendingInputs,
    savingRows,
    scheduleAutoSave,
    handleStatementAction,
    handleStatusSubmit,
    statusSubmitting,
    replaceState,
    selectedAssignment,
    closeReplaceModal,
    statusModalState,
    closeStatusModal,
    eventLogState,
    closeLogModal,
    handleReturnToLine,
    depotId,
    refresh: fetchData,
  }
}





