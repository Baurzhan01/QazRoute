"use client"

import { Button } from "@/components/ui/button"
import { Building2, Plus } from "lucide-react"
import ConvoyCard from "../ConvoyCard"
import type { Convoy, User } from "../../types"

interface ConvoysTabProps {
  convoys: Convoy[]
  users: User[]
  onEditConvoy: (convoy: Convoy) => void
  onViewConvoy: (convoy: Convoy) => void
  onAddConvoy: () => void
}

export default function ConvoysTab({ convoys, users, onEditConvoy, onViewConvoy, onAddConvoy }: ConvoysTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Автоколонны</h2>
        <Button onClick={onAddConvoy}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить автоколонну
        </Button>
      </div>

      {convoys.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Нет автоколонн</h3>
          <p className="text-gray-500 mb-4">Добавьте первую автоколонну, чтобы начать работу</p>
          <Button onClick={onAddConvoy}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить автоколонну
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {convoys.map((convoy) => (
            <ConvoyCard key={convoy.id} convoy={convoy} users={users} onEdit={onEditConvoy} onView={onViewConvoy} />
          ))}
        </div>
      )}
    </div>
  )
}

