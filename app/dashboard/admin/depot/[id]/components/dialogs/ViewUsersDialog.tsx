"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, UserPlus, Users } from "lucide-react"
import type { User } from "../../types"
import { getRoleCardTitle, getRoleName, getRoleKey } from "../../utils/roleUtils"

interface ViewUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: string | null
  usersByRole: Record<string, User[]>
  onEdit: (user: User) => void
  onAddUser: (role: string) => void
}

export default function ViewUsersDialog({
  open,
  onOpenChange,
  role,
  usersByRole,
  onEdit,
  onAddUser,
}: ViewUsersDialogProps) {
  if (!role) return null

  const roleKey = getRoleKey(role)
  const users = roleKey ? usersByRole[roleKey] : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{getRoleCardTitle(role)}</DialogTitle>
          <DialogDescription>Список всех пользователей с ролью {getRoleName(role)}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Должность</TableHead>
                {role === "fleet-manager" && <TableHead>Автоколонна</TableHead>}
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.position}</TableCell>
                  {role === "fleet-manager" && (
                    <TableCell>
                      {user.convoyNumber ? (
                        <Badge variant="outline" className="bg-sky-50">
                          Автоколонна №{user.convoyNumber}
                        </Badge>
                      ) : (
                        "Не назначена"
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onEdit(user)
                        onOpenChange(false)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Нет пользователей</h3>
              <p className="text-gray-500 mb-4">В этой категории пока нет пользователей</p>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  onAddUser(role)
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Добавить пользователя
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onAddUser(role)
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Добавить пользователя
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

