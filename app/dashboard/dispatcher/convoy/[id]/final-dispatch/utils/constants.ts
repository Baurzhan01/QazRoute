import type { ActionLogStatus } from "@/types/actionLog.types"
import type { DayType, WorkflowStatus } from "../types"

export enum StatementAction {
  Replace = "replace",
  ReportGotOff = "gotOff",
  SendToOrder = "order",
  Complete = "complete",
  Remove = "remove",
  ReturnToLine = "return",
  ViewLog = "log",
}

export const STATEMENT_WORKFLOW_STATUSES = [
  "OnWork",
  "GotOff",
  "OnOrder",
  "Completed",
  "Rejected",
] as const satisfies readonly WorkflowStatus[]

export const ACTION_LOG_STATUS_VALUES: ActionLogStatus[] = [
  "Code102",
  "Gps",
  "OffRoad",
  "DriverIllness",
  "DriverGsmFault",
  "DriverStkFault",
  "EmergencyCall",
  "AdditionalRevolutions",
  "Accident",
  "DriverAccident",
  "MidShiftCharging",
  "TrafficJam",
  "NoCharging",
  "NoRoute",
  "LowFuel",
  "ScheduleAhead",
  "DriverDelay",
  "Distraction",
  "NoPassengers",
  "Rearrangement",
  "GlDeparture",
  "PersonalReason",
  "Order",
  "MissedRevolution",
  "NotDriverFault",
  "FromGarage",
  "MidShift",
  "TechnicalIssue",
  "Emergency",
  "Replace",
  "Return", // 👈 добавлено для возврата на линию
]

export const ACTION_LOG_STATUS_LABELS: Record<ActionLogStatus, string> = {
  Code102: "Код 102",
  Gps: "Проблема GPS",
  OffRoad: "Сошёл с линии",
  DriverIllness: "Водитель заболел",
  DriverGsmFault: "Неисправность GSM",
  DriverStkFault: "Неисправность СТК",
  EmergencyCall: "Экстренный вызов",
  AdditionalRevolutions: "Дополнительные обороты",
  Accident: "ДТП",
  DriverAccident: "Происшествие с водителем",
  MidShiftCharging: "Подзарядка в смене",
  TrafficJam: "Пробка",
  NoCharging: "Нет зарядки",
  NoRoute: "Нет маршрута",
  LowFuel: "Мало топлива",
  ScheduleAhead: "Впереди графика",
  DriverDelay: "Опоздание водителя",
  Distraction: "Отвлечение",
  NoPassengers: "Нет пассажиров",
  Rearrangement: "Перестановка",
  GlDeparture: "Выезд ГЛ",
  PersonalReason: "Личные причины",
  Order: "Заказ",
  MissedRevolution: "Пропущенный оборот",
  NotDriverFault: "Не по вине водителя",
  FromGarage: "Выезд из гаража",
  MidShift: "Середина смены",
  TechnicalIssue: "Техническая неисправность",
  Emergency: "Чрезвычайная ситуация",
  Replace: "Замена",
  Return: "Возврат на линию",
}

export const STATEMENT_STATUS_LABELS: Record<string, string> = {
  OnWork: "На линии",
  GotOff: "Временный сход",
  OnOrder: "На заказе",
  Completed: "Завершено",
  Rejected: "Снят",
}

export const routeStatusMap: Record<DayType, string> = {
  workday: "Workday",
  saturday: "Saturday",
  sunday: "Sunday",
  holiday: "Holiday",
}

export const statusMeta: Record<WorkflowStatus, { label: string; className: string; rowClass?: string }> = {
  OnWork: {
    label: "На линии",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  GotOff: {
    label: "Временный сход",
    // 🟡 Яркий цвет для статуса "GotOff"
    className: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    rowClass: "bg-yellow-100/90", // ярче, чем раньше
  },
  OnOrder: {
    label: "На заказе",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
    rowClass: "bg-purple-50/60",
  },
  Completed: {
    label: "Завершено",
    className: "bg-sky-50 text-sky-700 border border-sky-200",
    rowClass: "bg-sky-50/60",
  },
  Rejected: {
    label: "Снят",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
    rowClass: "bg-rose-50/60",
  },
  Unknown: {
    label: "Без статуса",
    className: "bg-slate-50 text-slate-600 border border-slate-200",
  },
}

export const actionsByStatus: Record<WorkflowStatus, StatementAction[]> = {
  OnWork: [
    StatementAction.Replace,
    StatementAction.ReportGotOff,
    StatementAction.SendToOrder,
    StatementAction.Complete,
    StatementAction.Remove,
    StatementAction.ViewLog,
  ],
  GotOff: [
    StatementAction.ReturnToLine,
    StatementAction.Remove,
    StatementAction.ViewLog,
  ],
  OnOrder: [
    StatementAction.Replace,
    StatementAction.ReportGotOff,
    StatementAction.SendToOrder,
    StatementAction.Complete,
    StatementAction.Remove,
    StatementAction.ViewLog,
  ],
  Completed: [StatementAction.ViewLog],
  Rejected: [StatementAction.Replace,
    StatementAction.ReportGotOff,
    StatementAction.SendToOrder,
    StatementAction.Complete,
    StatementAction.Remove,
    StatementAction.ViewLog,
  ],
  Unknown: [
    StatementAction.Replace,
    StatementAction.ReportGotOff,
    StatementAction.SendToOrder,
    StatementAction.Complete,
    StatementAction.Remove,
    StatementAction.ViewLog,
  ],
}
