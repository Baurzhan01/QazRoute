import type { UserRole } from "../types"
import { Briefcase, Clock, FileText, Users, Wrench, UserCog, Shield, Building } from "lucide-react"

const roleMap: Record<UserRole, { name: string; cardTitle: string; key: string }> = {
  admin: {
    name: "Администратор",
    cardTitle: "Пользователи с ролью Администратор",
    key: "admin",
  },
  fleetManager: {
    name: "Начальник колонны",
    cardTitle: "Пользователи с ролью Начальник колонны",
    key: "fleetManager",
  },
  mechanic: {
    name: "Механик",
    cardTitle: "Пользователи с ролью Механик",
    key: "mechanic",
  },
  mechanicOnDuty: {
    name: "Дежурный механик",
    cardTitle: "Пользователи с ролью Дежурный механик",
    key: "mechanicOnDuty",
  },
  dispatcher: {
    name: "Диспетчер",
    cardTitle: "Пользователи с ролью Диспетчер",
    key: "dispatcher",
  },
  seniorDispatcher: {
    name: "Старший диспетчер",
    cardTitle: "Пользователи с ролью Старший диспетчер",
    key: "seniorDispatcher",
  },
  hr: {
    name: "Отдел кадров",
    cardTitle: "Пользователи с ролью Отдел кадров",
    key: "hr",
  },
  taskInspector: {
    name: "Отдел таксировки",
    cardTitle: "Пользователи с ролью Отдел таксировки",
    key: "taskInspector",
  },
  CTS: {
    name: "КТС",
    cardTitle: "Пользователи с ролью КТС",
    key: "CTS",
  },
  MCC: {
    name: "ЦУП",
    cardTitle: "Пользователи с ролью ЦУП",
    key: "MCC",
  },
}

export function getRoleName(role: string): string {
  return roleMap[role as UserRole]?.name ?? "Неизвестная роль"
}

export function getRoleCardTitle(role: string): string {
  return roleMap[role as UserRole]?.cardTitle ?? "Пользователи"
}

export function getRoleKey(role: string): string {
  return roleMap[role as UserRole]?.key ?? ""
}

export const getRoleCardGradient = (role: UserRole): string => {
  switch (role) {
    case "fleetManager": return "from-sky-500 to-sky-700"
    case "seniorDispatcher": return "from-amber-500 to-amber-700"
    case "dispatcher": return "from-green-500 to-green-700"
    case "mechanic": return "from-purple-500 to-purple-700"
    case "hr": return "from-rose-500 to-rose-700"
    case "taskInspector": return "from-blue-500 to-blue-700"
    case "admin": return "from-gray-500 to-gray-700"
    case "mechanicOnDuty": return "from-indigo-500 to-indigo-700"
    case "CTS": return "from-red-500 to-red-700"
    case "MCC": return "from-yellow-500 to-yellow-600"
    default: return "from-gray-400 to-gray-600"
  }
}

export const getRoleBorderColor = (role: UserRole): string => {
  const map: Record<UserRole, string> = {
    fleetManager: "border-sky-500",
    seniorDispatcher: "border-amber-500",
    dispatcher: "border-green-500",
    mechanic: "border-purple-500",
    hr: "border-rose-500",
    taskInspector: "border-blue-500",
    admin: "border-gray-500",
    mechanicOnDuty: "border-indigo-500",
    CTS: "border-red-500",
    MCC: "border-yellow-500",
  }

  return map[role] ?? "border-gray-400"
}
