"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Lock, Unlock, Trash, Key } from "lucide-react"
import type { Dispatcher, DispatcherStatus } from "../types/dispatcher.types"
import { Input } from "@/components/ui/input"

interface DispatcherActionsProps {
  dispatcher: Dispatcher
  onEdit: (dispatcher: Dispatcher) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: DispatcherStatus) => void
  onChangePassword: (id: string, newPassword: string) => void
}

export function DispatcherActions({
  dispatcher,
  onEdit,
  onDelete,
  onChangeStatus,
  onChangePassword
}: DispatcherActionsProps) {
  const [newPassword, setNewPassword] = useState("")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Открыть меню</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(dispatcher)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Редактировать</span>
        </DropdownMenuItem>
        {dispatcher.status === "blocked" ? (
          <DropdownMenuItem onClick={() => onChangeStatus(dispatcher.id, "offline")}>
            <Unlock className="mr-2 h-4 w-4" />
            <span>Разблокировать</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onChangeStatus(dispatcher.id, "blocked")}>
            <Lock className="mr-2 h-4 w-4" />
            <span>Заблокировать</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="flex flex-col items-start space-y-2"
        >
          <div className="flex items-center w-full gap-2">
            <Key className="h-4 w-4" />
            <span>Сменить пароль</span>
          </div>
          <div className="flex items-center gap-2 w-full mt-2">
            <Input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Новый пароль"
              className="h-8 px-2 text-xs"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!newPassword.trim()}
              onClick={() => {
                onChangePassword(dispatcher.id, newPassword.trim())
                setNewPassword("")
              }}
            >
              OK
            </Button>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(dispatcher.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Удалить</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
