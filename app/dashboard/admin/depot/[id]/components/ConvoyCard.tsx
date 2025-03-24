"use client"

import type { Convoy, User } from "../types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Briefcase, Wrench, Edit, Eye } from "lucide-react"

interface ConvoyCardProps {
  convoy: Convoy
  users: User[]
  onEdit: (convoy: Convoy) => void
  onView: (convoy: Convoy) => void
}

export default function ConvoyCard({ convoy, users, onEdit, onView }: ConvoyCardProps) {
  const chief = users.find((u) => u.id === convoy.chiefId)
  const mechanic = users.find((u) => u.id === convoy.mechanicId)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Автоколонна №{convoy.number}
        </CardTitle>
        <CardDescription className="text-sky-100">{convoy.busIds.length} автобусов</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-sky-500" />
            <div>
              <p className="text-sm text-gray-500">Начальник колонны</p>
              <p className="font-medium">{chief ? chief.name : "Не назначен"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Механик</p>
              <p className="font-medium">{mechanic ? mechanic.name : "Не назначен"}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onView(convoy)}>
          <Eye className="mr-2 h-4 w-4" />
          Подробнее
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(convoy)}>
          <Edit className="mr-2 h-4 w-4" />
          Редактировать
        </Button>
      </CardFooter>
    </Card>
  )
}

