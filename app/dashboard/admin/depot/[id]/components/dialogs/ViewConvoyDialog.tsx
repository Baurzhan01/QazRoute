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
import { Badge } from "@/components/ui/badge"
import { Building2, Briefcase, Wrench, Trash2, Edit } from "lucide-react"
import type { Convoy, User } from "../../types"

interface ViewConvoyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  convoy: Convoy | null
  users: User[]
  onEdit: (convoy: Convoy) => void
  onDelete: () => void
}

export default function ViewConvoyDialog({
  open,
  onOpenChange,
  convoy,
  users,
  onEdit,
  onDelete,
}: ViewConvoyDialogProps) {
  if (!convoy) return null

  const chief = users.find((u) => u.id === convoy.chiefId)
  const mechanic = users.find((u) => u.id === convoy.mechanicId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Автоколонна №{convoy.number}</DialogTitle>
          <DialogDescription>Детальная информация об автоколонне</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Building2 className="h-12 w-12 text-sky-500" />
              <div>
                <h3 className="text-lg font-medium">Автоколонна №{convoy.number}</h3>
                <p className="text-sm text-gray-500">{convoy.busIds.length} автобусов</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="text-sm text-gray-500">Начальник колонны</p>
                    <p className="font-medium">{chief ? chief.name : "Не назначен"}</p>
                  </div>
                </div>
                {chief && (
                  <Badge variant="outline" className="bg-sky-50">
                    Назначен
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Механик</p>
                    <p className="font-medium">{mechanic ? mechanic.name : "Не назначен"}</p>
                  </div>
                </div>
                {mechanic && (
                  <Badge variant="outline" className="bg-purple-50">
                    Назначен
                  </Badge>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Автобусы в колонне</h4>
              {convoy.busIds.length > 0 ? (
                <div className="space-y-2">
                  {convoy.busIds.map((busId, index) => (
                    <div key={busId} className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50">
                        {index + 1}
                      </Badge>
                      <span>Автобус ID: {busId}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">В колонне нет автобусов</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false)
                onEdit(convoy)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

