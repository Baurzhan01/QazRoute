"use client";

import { Button } from "@/components/ui/button";
import { Briefcase, Clock, FileText, Users, Wrench, UserPlus } from "lucide-react";
import UserCard from "../UserCard";
import type { User } from "../../types";

interface UsersTabProps {
  usersByRole: Partial<Record<User["role"], User[]>>;
  onEditUser: (user: User) => void;
  onViewUsers: (role: string) => void;
  onAddUser: () => void;
  onDeleteUser: (userId: string) => void; // Добавляем пропс для удаления
}

export default function UsersTab({ usersByRole, onEditUser, onViewUsers, onAddUser, onDeleteUser }: UsersTabProps) {
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
        <UserCard
          title={<div className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Начальники колонн</div>}
          role="fleetManager"
          users={usersByRole.fleetManager || []}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
          onDelete={onDeleteUser} // Передаем обработчик удаления
        />
        <UserCard
          title={<div className="flex items-center gap-2"><Clock className="h-5 w-5" /> Старшие диспетчеры</div>}
          role="seniorDispatcher"
          users={usersByRole.seniorDispatcher || []}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
          onDelete={onDeleteUser}
        />
        <UserCard
          title={<div className="flex items-center gap-2"><Clock className="h-5 w-5" /> Диспетчеры</div>}
          role="dispatcher"
          users={usersByRole.dispatcher || []}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
          onDelete={onDeleteUser}
        />
        <UserCard
          title={<div className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Механики</div>}
          role="mechanic"
          users={usersByRole.mechanic || []}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
          onDelete={onDeleteUser}
        />
        <UserCard
          title={<div className="flex items-center gap-2"><Users className="h-5 w-5" /> Отдел кадров</div>}
          role="hr"
          users={usersByRole.hr || []}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
          onDelete={onDeleteUser}
        />
        <UserCard
          title={<div className="flex items-center gap-2"><FileText className="h-5 w-5" /> Отдел таксировки</div>}
          role="taskInspector"
          users={usersByRole.taskInspector || []}
          onEdit={onEditUser}
          onViewAll={onViewUsers}
          onAddUser={onAddUser}
          onDelete={onDeleteUser}
        />
      </div>
    </div>
  );
}