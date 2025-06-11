"use client"

import type { Convoy, User } from "../types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Edit, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getRoleBorderColor } from "../utils/roleUtils"

interface ConvoyCardProps {
  convoy: Convoy
  users: User[]
  onEdit: (convoy: Convoy) => void
  onView: (convoy: Convoy) => void
}

export default function ConvoyCard({ convoy, users, onEdit, onView }: ConvoyCardProps) {
  const chiefUser = users.find(u => u.id === convoy.chiefId)
  const mechanicUser = users.find(u => u.id === convoy.mechanicId)

  const chief = chiefUser || convoy.chief
  const mechanic = mechanicUser || convoy.mechanic

  const chiefName = chief?.fullName || "Не назначен"
  const mechanicName = mechanic?.fullName || "Не назначен"
  const busesCount = convoy.busIds?.length || convoy.buses?.length || 0

  return (
    <Card className="overflow-hidden hover:shadow-md transition-transform hover:scale-[1.01] duration-200 ease-in-out">
      <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Автоколонна №{convoy.number}
        </CardTitle>
        <CardDescription className="text-sky-100">
          {busesCount} {busesCount === 1 ? "автобус" : "автобусов"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Начальник колонны */}
        <div className="flex items-center gap-3">
          <Avatar className={`h-10 w-10 border-2 ${getRoleBorderColor("fleetManager")}`}>
            <AvatarImage src={chiefUser?.avatar} alt={chiefName} />
            <AvatarFallback>
              {chiefName
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-500">Начальник колонны</p>
            <p className="font-medium">{chiefName}</p>
          </div>
        </div>

        {/* Механик */}
        <div className="flex items-center gap-3">
          <Avatar className={`h-10 w-10 border-2 ${getRoleBorderColor("mechanic")}`}>
            <AvatarImage src={mechanicUser?.avatar} alt={mechanicName} />
            <AvatarFallback>
              {mechanicName
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-500">Механик</p>
            <p className="font-medium">{mechanicName}</p>
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
