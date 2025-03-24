"use client"

import { Button } from "@/components/ui/button"
import { Briefcase, Clock, FileText, Users, Wrench, UserPlus } from "lucide-react"
import UserCard from "../UserCard"
import type { User } from "../../types"

interface UsersTabProps {
  usersByRole: {
    fleetManager: User[]
    seniorDispatcher: User[]
    dispatcher: User[]
    mechanic: User[]
    hr: User[]
    taksirovka: User[]
  }
  onEditUser: (user: User) => void
  onViewUsers: (role: string) => void
  onAddUser: () => void
}

export default function UsersTab({ usersByRole, onEditUser, onViewUsers, onAddUser }: UsersTabProps) {
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
        {/* Карточка начальников колонн */}
        <UserCard
          title={
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Начальники колонн
            </div>
          }
          role="fleet-manager"
          users={usersByRole.fleetManager}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
        />

        {/* Карточка старших диспетчеров */}
        <UserCard
          title={
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Старшие диспетчеры
            </div>
          }
          role="senior-dispatcher"
          users={usersByRole.seniorDispatcher}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
        />

        {/* Карточка диспетчеров */}
        <UserCard
          title={
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Диспетчеры
            </div>
          }
          role="dispatcher"
          users={usersByRole.dispatcher}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
        />

        {/* Карточка механиков */}
        <UserCard
          title={
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Механики
            </div>
          }
          role="mechanic"
          users={usersByRole.mechanic}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
        />

        {/* Карточка отдела кадров */}
        <UserCard
          title={
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Отдел кадров
            </div>
          }
          role="hr"
          users={usersByRole.hr}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
        />

        {/* Карточка отдела таксировки */}
        <UserCard
          title={
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Отдел таксировки
            </div>
          }
          role="taksirovka"
          users={usersByRole.taksirovka}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
        />
      </div>
    </div>
  )
}

