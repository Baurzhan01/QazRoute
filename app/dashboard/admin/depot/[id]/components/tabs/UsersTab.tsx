"use client"

import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  Clock, 
  FileText, 
  Users, 
  Wrench, 
  UserPlus, 
  Shield, 
  Building2,
  ShieldCheck,
  UserCog // 👈 добавь сюда
} from "lucide-react"

import UserCard from "../UserCard"
import type { User, UserRole } from "../../types"

interface UsersTabProps {
  usersByRole: Partial<Record<User["role"], User[]>>;
  onEditUser: (user: User) => void;
  onViewUsers: (role: User["role"]) => void;
  onAddUser: () => void;
  onDeleteUser: (userId: string) => void;
}

const roleDefinitions: { key: UserRole; icon: React.ElementType; label: string }[] = [
  { key: "fleetManager", icon: Briefcase, label: "Начальники колонн" },
  { key: "seniorDispatcher", icon: Clock, label: "Старшие диспетчеры" },
  { key: "dispatcher", icon: Clock, label: "Диспетчеры" },
  { key: "mechanic", icon: Wrench, label: "Механики" },
  { key: "hr", icon: Users, label: "Отдел кадров" },
  { key: "taskInspector", icon: FileText, label: "Отдел таксировки" },
  { key: "CTS", icon: Shield, label: "КТС (Контроль тех. состояния)" },
  { key: "OTK", icon: ShieldCheck, label: "ОТК (Отдел технического контроля)" },
  { key: "MCC", icon: Building2, label: "ЦУП (Центр управления)" },
  { key: "LRT", icon: Building2, label: "LRT (Логистика/Ремонт/Транспорт)" },
  { key: "Guide", icon: UserCog, label: "Руководство" },
]



export default function UsersTab({
  usersByRole,
  onEditUser,
  onViewUsers,
  onAddUser,
  onDeleteUser,
}: UsersTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Пользователи автобусного парка</h2>
        <Button onClick={onAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Добавить пользователя
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleDefinitions.map(({ key, icon: Icon, label }) => (
          <UserCard
            key={key}
            title={<div className="flex items-center gap-2"><Icon className="h-5 w-5" /> {label}</div>}
            role={key}
            users={usersByRole[key] || []}
            onEdit={onEditUser}
            onViewAll={onViewUsers}
            onAddUser={onAddUser}
            onDelete={onDeleteUser}
          />
        ))}
      </div>
    </div>
  )
}
