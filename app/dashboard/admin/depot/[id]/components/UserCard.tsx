"use client"

import type { User, UserRole } from "../types"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Eye, UserPlus, Trash2, ShieldAlert, ActivitySquare, UserCog } from "lucide-react"
import { getRoleCardGradient, getRoleBorderColor } from "../utils/roleUtils"

interface UserCardProps {
  title: React.ReactNode
  role: UserRole
  users: User[]
  onEdit: (user: User) => void
  onViewAll: (role: UserRole) => void
  onAddUser: () => void
  onDelete: (userId: string) => void
}

function getRoleColorClass(role: UserRole): string {
  const map: Record<UserRole, string> = {
    fleetManager: "text-sky-100",
    seniorDispatcher: "text-amber-100",
    dispatcher: "text-green-100",
    mechanic: "text-purple-100",
    hr: "text-rose-100",
    taskInspector: "text-blue-100",
    admin: "text-gray-100",
    mechanicOnDuty: "text-indigo-100",
    CTS: "text-red-100",
    MCC: "text-yellow-100",
    LRT: "text-cyan-100",
    Guide: "text-pink-100",
  }
  return map[role] ?? "text-gray-300"
}

function getRoleIcon(role: UserRole) {
  if (role === "CTS") return <ShieldAlert className="h-4 w-4" />
  if (role === "MCC") return <ActivitySquare className="h-4 w-4" />
  if (role === "Guide") return <UserCog className="h-4 w-4" />

  return null
}

export default function UserCard({
  title,
  role,
  users,
  onEdit,
  onViewAll,
  onAddUser,
  onDelete,
}: UserCardProps) {
  const roleColorClass = getRoleColorClass(role)
  const borderColorClass = getRoleBorderColor(role)
  const sortedUsers = [...users].sort((a, b) => a.fullName.localeCompare(b.fullName))

  return (
    <Card className="overflow-hidden hover:shadow-md transition-transform hover:scale-[1.01] duration-200 ease-in-out">
      <CardHeader className={`bg-gradient-to-r ${getRoleCardGradient(role)} text-white`}>
        <CardTitle className="flex items-center gap-2">
          {getRoleIcon(role)}
          {title}
        </CardTitle>
        <CardDescription className={roleColorClass}>
          {users.length} {users.length === 1 ? "пользователь" : "пользователей"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
          {sortedUsers.length > 0 ? (
            sortedUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between hover:bg-gray-50 px-2 py-2 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className={`h-10 w-10 border-2 ${borderColorClass}`}>
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback>
                      {user.fullName.trim()
                        ? user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {user.position || "Нет должности"}
                      {(user.role === "CTS" || user.role === "MCC") && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded bg-opacity-20 ${
                          user.role === "CTS" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">Нет пользователей с этой ролью</div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between">
        {sortedUsers.length > 3 && (
          <Button variant="ghost" size="sm" onClick={() => onViewAll(role)}>
            <Eye className="mr-2 h-4 w-4" />
            Все ({users.length})
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </CardFooter>
    </Card>
  )
}
