import { format } from "date-fns"

import type { ActionLogStatus } from "@/types/actionLog.types"
import type { UpdateStatementPayload } from "@/types/statement.types"
import type {
  StatementActionLogEntry,
  StatementBusLine,
  StatementBusShort,
  StatementDriverShort,
  StatementRoute,
  TimeObject,
} from "@/types/releasePlanTypes"
import { DispatchBusLineStatus } from "@/types/releasePlanTypes"

import type {
  RouteBucket,
  StatementActionLog,
  StatementRow,
  WorkflowStatus,
} from "../types"
import { ACTION_LOG_STATUS_LABELS, STATEMENT_STATUS_LABELS, STATEMENT_WORKFLOW_STATUSES } from "./constants"

export const formatTime = (value?: string | null): string => {
  if (!value) return "-"

  try {
    return format(new Date(`1970-01-01T${value}`), "HH:mm")
  } catch (error) {
    return value
  }
}

export const formatActionLogTime = (value: string | TimeObject): string => {
  if (typeof value === "string") {
    return value
  }

  const { hour = 0, minute = 0 } = value
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export const classNames = (
  ...values: Array<string | null | undefined | false>
): string => values.filter(Boolean).join(" ")

export const prettifyStatus = (status: string): string => {
  if (status in ACTION_LOG_STATUS_LABELS) {
    return ACTION_LOG_STATUS_LABELS[status as ActionLogStatus]
  }

  return status.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])(\d+)/g, "$1 $2")
}

export const prettifyStatementStatus = (status: string): string => {
  if (status in STATEMENT_STATUS_LABELS) {
    return STATEMENT_STATUS_LABELS[status]
  }

  return status.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])(\d+)/g, "$1 $2")
}

export const normalizeStatus = (
  status: StatementBusLine["status"] | WorkflowStatus | null | undefined
): WorkflowStatus => {
  if (status == null) {
    return "OnWork"
  }

  if (typeof status === "string") {
    if ((STATEMENT_WORKFLOW_STATUSES as readonly string[]).includes(status)) {
      return status as WorkflowStatus
    }

    switch (status) {
      case "Released":
      case "Replaced":
      case "Permutation":
      case "Removed":
      case "RearrangingRoute":
      case "RearrangementRenovation":
      case "Oder":
      case "LaunchedFromGarage":
      case "Undefined":
        return "OnWork"
      default:
        return "Unknown"
    }
  }

  if (typeof status === "number") {
    return status === DispatchBusLineStatus.Removed ? "Rejected" : "OnWork"
  }

  return "Unknown"
}

export const toStatementRow = (
  route: StatementRoute,
  line: StatementBusLine
): StatementRow => ({
  routeId: route.routeId,
  routeNumber: route.routeNumber,
  dispatchBusLineId: line.dispatchBusLineId,
  statementId: line.statementId ?? null,
  busLineNumber: line.busLineNumber,
  exitTime: line.exitTime ?? null,
  endTime: line.endTime ?? null,
  status: normalizeStatus(line.status),
  planRevolutions: line.planRevolutions ?? null,
  factRevolutions: line.factRevolutions ?? null,
  spokenRevolutions: line.revolutions ?? null,
  busGarageNumber: line.bus?.garageNumber ?? null,
  busGovNumber: line.bus?.govNumber ?? null,
  driverId: line.firstDriver?.id ?? null,        // 👈 добавлено
  busId: line.bus?.id ?? null,                   // 👈 добавлено
  driverName: line.firstDriver?.fullName ?? null,
  driverServiceNumber: line.firstDriver?.serviceNumber ?? null,
  description: line.description ?? null,
  raw: line,
})

const TRAILING_STATUSES: ReadonlySet<WorkflowStatus> = new Set([
  "OnOrder",
  "Rejected",
])

const parseBusLinePosition = (value: string): number => {
  if (!value) return Number.POSITIVE_INFINITY
  const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".")
  const parsed = Number.parseFloat(normalized)
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed
}

const sortStatementRows = (rows: StatementRow[]): StatementRow[] => {
  return [...rows].sort((a, b) => {
    const aTrailing = TRAILING_STATUSES.has(a.status)
    const bTrailing = TRAILING_STATUSES.has(b.status)
    if (aTrailing !== bTrailing) {
      return aTrailing ? 1 : -1
    }

    const aPos = parseBusLinePosition(a.busLineNumber)
    const bPos = parseBusLinePosition(b.busLineNumber)
    if (aPos !== bPos) {
      return aPos - bPos
    }

    return a.busLineNumber.localeCompare(b.busLineNumber, undefined, { numeric: true, sensitivity: "base" })
  })
}

export const collectActionLogsFromBuckets = (
  buckets: RouteBucket[],
  key: "removed" | "onOrder"
): StatementActionLog[] => {
  const logs: StatementActionLog[] = []
  buckets.forEach(bucket => {
    bucket.rows.forEach(row => {
      const entries = row.raw[key]
      if (!entries?.length) return
      entries.forEach(entry => {
        logs.push({ ...entry })
      })
    })
  })
  return logs
}

export const splitRoutes = (value: StatementRoute[]): RouteBucket[] =>
  value.map(route => {
    const rows = (route.busLines ?? []).map(line => toStatementRow(route, line))
    return {
      id: route.routeId,
      number: route.routeNumber,
      rows: sortStatementRows(rows),
    }
  })


export const buildAssignmentPayload = (row: StatementRow) => ({
  dispatchBusLineId: row.dispatchBusLineId,
  busLineNumber: row.busLineNumber,
  routeName: `Маршрут №${row.routeNumber}`,
  route: { name: `Маршрут №${row.routeNumber}` },
  driver: row.raw.firstDriver ? { ...row.raw.firstDriver } : null,
  bus: row.raw.bus ? { ...row.raw.bus } : null,
})

export const buildStatementPayload = (
  row: StatementRow,
  overrides: Partial<UpdateStatementPayload>
): UpdateStatementPayload => {
  const payload: UpdateStatementPayload = {
    dispatchBusLineId: row.dispatchBusLineId,
  }

  if (overrides.status) {
    payload.status = overrides.status
  }

  if (overrides.driversRevolutions !== undefined) {
    payload.driversRevolutions = overrides.driversRevolutions
    payload.spokenRevolutions =
      overrides.spokenRevolutions !== undefined
        ? overrides.spokenRevolutions
        : overrides.driversRevolutions
  }

  if (overrides.spokenRevolutions !== undefined) {
    payload.spokenRevolutions = overrides.spokenRevolutions

    if (payload.driversRevolutions === undefined) {
      payload.driversRevolutions = overrides.spokenRevolutions
    }
  }

  if (overrides.factRevolutions !== undefined) {
    payload.factRevolutions = overrides.factRevolutions
  }

  if (overrides.planRevolutions !== undefined) {
    payload.planRevolutions = overrides.planRevolutions
  }

  if (overrides.description !== undefined) {
    payload.description = overrides.description
  }

  if (overrides.actionStatus !== undefined) {
    payload.actionStatus = overrides.actionStatus
  }

  if (overrides.gatherings !== undefined) {
    payload.gatherings = overrides.gatherings
  }

  if (overrides.route !== undefined) {
    payload.route = overrides.route
  }

  return payload
}

export const findRowById = (
  buckets: RouteBucket[],
  dispatchBusLineId: string
): StatementRow | undefined => {
  for (const bucket of buckets) {
    const found = bucket.rows.find(row => row.dispatchBusLineId === dispatchBusLineId)
    if (found) {
      return found
    }
  }

  return undefined
}

export const collectRemovedRows = (buckets: RouteBucket[]): StatementRow[] => {
  const removed: StatementRow[] = []

  buckets.forEach(bucket => {
    bucket.rows.forEach(row => {
      if (row.status === "Rejected") {
        removed.push(row)
      }
    })
  })

  return removed
}

export const formatActionLogDriver = (driver?: StatementDriverShort | null): string => {
  if (!driver) {
    return "-"
  }

  if (!driver.serviceNumber) {
    return driver.fullName
  }

  return `${driver.fullName} (${driver.serviceNumber})`
}

export const formatActionLogBus = (bus?: StatementBusShort | null): string => {
  if (!bus) {
    return "-"
  }

  return `${bus.garageNumber}/${bus.govNumber}`
}

export const mapActionLogs = (
  entries: StatementActionLogEntry[] | undefined
): StatementActionLog[] => entries?.map(entry => ({ ...entry })) ?? []
