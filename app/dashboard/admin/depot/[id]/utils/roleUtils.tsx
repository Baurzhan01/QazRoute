import type { UserRole } from "../types"
import { Briefcase, Clock, FileText, Users, Wrench, UserCog, Shield, Building } from "lucide-react"

const roleMap: Record<UserRole, { name: string; cardTitle: string; key: string }> = {
  admin: {
    name: "¦Ð¦+¦-¦¬¦-¦¬TÁTÂTÀ¦-TÂ¦-TÀ",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦Ð¦+¦-¦¬¦-¦¬TÁTÂTÀ¦-TÂ¦-TÀ",
    key: "admin",
  },
  fleetManager: {
    name: "¦Ý¦-TÇ¦-¦¬TÌ¦-¦¬¦¦ ¦¦¦-¦¬¦-¦-¦-TË",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦Ý¦-TÇ¦-¦¬TÌ¦-¦¬¦¦ ¦¦¦-¦¬¦-¦-¦-TË",
    key: "fleetManager",
  },
  mechanic: {
    name: "¦Ü¦¦TÅ¦-¦-¦¬¦¦",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦Ü¦¦TÅ¦-¦-¦¬¦¦",
    key: "mechanic",
  },
  mechanicOnDuty: {
    name: "¦Ô¦¦¦¦TÃTÀ¦-TË¦¦ ¦-¦¦TÅ¦-¦-¦¬¦¦",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦Ô¦¦¦¦TÃTÀ¦-TË¦¦ ¦-¦¦TÅ¦-¦-¦¬¦¦",
    key: "mechanicOnDuty",
  },
  dispatcher: {
    name: "¦Ô¦¬TÁ¦¬¦¦TÂTÇ¦¦TÀ",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦Ô¦¬TÁ¦¬¦¦TÂTÇ¦¦TÀ",
    key: "dispatcher",
  },
  seniorDispatcher: {
    name: "¦áTÂ¦-TÀTÈ¦¬¦¦ ¦+¦¬TÁ¦¬¦¦TÂTÇ¦¦TÀ",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦áTÂ¦-TÀTÈ¦¬¦¦ ¦+¦¬TÁ¦¬¦¦TÂTÇ¦¦TÀ",
    key: "seniorDispatcher",
  },
  hr: {
    name: "¦ÞTÂ¦+¦¦¦¬ ¦¦¦-¦+TÀ¦-¦-",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦ÞTÂ¦+¦¦¦¬ ¦¦¦-¦+TÀ¦-¦-",
    key: "hr",
  },
  taskInspector: {
    name: "¦ÞTÂ¦+¦¦¦¬ TÂ¦-¦¦TÁ¦¬TÀ¦-¦-¦¦¦¬",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦ÞTÂ¦+¦¦¦¬ TÂ¦-¦¦TÁ¦¬TÀ¦-¦-¦¦¦¬",
    key: "taskInspector",
  },
  CTS: {
    name: "¦Ú¦â¦á",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦Ú¦â¦á",
    key: "CTS",
  },
  MCC: {
    name: "¦æ¦ã¦ß",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦æ¦ã¦ß",
    key: "MCC",
  },
  OTK: {
    name: "ÎÒÊ (Îòäåë òåõíè÷åñêîãî êîíòðîëÿ)",
    cardTitle: "Ïîëüçîâàòåëè ñ ðîëüþ ÎÒÊ",
    key: "OTK",
  },
  LRT: {
    name: "LRT",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ LRT",
    key: "LRT",
  },  
  Guide: {
    name: "¦àTÃ¦¦¦-¦-¦-¦+TÁTÂ¦-¦-",
    cardTitle: "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬ TÁ TÀ¦-¦¬TÌTÎ ¦àTÃ¦¦¦-¦-¦-¦+TÁTÂ¦-¦-",
    key: "Guide",
  },
}

// utils/roleUtils.ts (¦¬¦¬¦¬ ¦-¦-¦¦TÀTÅTÃ useUsers.ts, ¦¦TÁ¦¬¦¬ ¦¬¦-¦¦¦-¦¬TÌ¦-¦-)
export const normalizeRole = (role?: string): UserRole => {
  if (!role || typeof role !== "string") return "dispatcher" // ¦+¦¦TÄ¦-¦¬TÂ¦-¦-TÏ ¦-¦¦¦¬¦-¦¬¦-TÁ¦-¦-TÏ TÀ¦-¦¬TÌ

  const exceptions: Record<string, UserRole> = {
    CTS: "CTS",
    MCC: "MCC",
    LRT: "LRT",
    Guide: "Guide",
    OTK: "OTK",
  }

  return exceptions[role] ?? (role.charAt(0).toLowerCase() + role.slice(1)) as UserRole
}



export function getRoleName(role: string): string {
  return roleMap[role as UserRole]?.name ?? "¦Ý¦¦¦¬¦¬¦-¦¦TÁTÂ¦-¦-TÏ TÀ¦-¦¬TÌ"
}

export function getRoleCardTitle(role: string): string {
  return roleMap[role as UserRole]?.cardTitle ?? "¦ß¦-¦¬TÌ¦¬¦-¦-¦-TÂ¦¦¦¬¦¬"
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
    case "OTK": return "from-emerald-500 to-emerald-700"
    case "Guide": return "from-pink-500 to-pink-700"
    case "LRT": return "from-cyan-500 to-cyan-700"
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
    OTK: "border-emerald-500",
    Guide: "text-pink-100",
    LRT: "text-cyan-100",
  }

  return map[role] ?? "border-gray-400"
}


