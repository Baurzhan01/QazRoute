"use client"

import type { User } from "../types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Eye, UserPlus } from "lucide-react"
import { getRoleCardGradient } from "../utils/roleUtils"

interface UserCardProps {
  title: string
  role: string
  users: User[]
  onEdit: (user: User) => void
  onViewAll: (role: string) => void
  onAddUser: () => void
}

export default function UserCard({ title, role, users, onEdit, onViewAll, onAddUser }: UserCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className={`bg-gradient-to-r ${getRoleCardGradient(role)} text-white`}>
        <CardTitle className="flex items-center gap-2">
          {/* Иконка добавляется в родительском компоненте */}
          {title}
        </CardTitle>
        <CardDescription
          className={
            role === "fleet-manager"
              ? "text-sky-100"
              : role === "senior-dispatcher"
                ? "text-amber-100"
                : role === "dispatcher"
                  ? "text-green-100"
                  : role === "mechanic"
                    ? "text-purple-100"
                    : role === "hr"
                      ? "text-rose-100"
                      : "text-blue-100"
          }
        >
          {users.length} пользователей
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.position}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {users.length === 0 && <div className="text-center py-4 text-gray-500">Нет пользователей с этой ролью</div>}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onViewAll(role)}>
          <Eye className="mr-2 h-4 w-4" />
          Просмотреть всех
        </Button>
        <Button variant="ghost" size="sm" onClick={onAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </CardFooter>
    </Card>
  )
}

