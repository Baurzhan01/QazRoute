"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Plus } from "lucide-react"
import Link from "next/link"
import { formatDateLabel } from "@/app/dashboard/fleet-manager/release-plan/utils/dateUtils"
import { releasePlanService } from "@/service/releasePlanService"

interface ReserveAssignment {
  driverId: string | null
  busId: string | null
  description: string | null
}

export default function ReservePage() {
  const params = useParams()
  const router = useRouter()
  const date = params?.date as string

  const [assignments, setAssignments] = useState<ReserveAssignment[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const handleAddAssignment = () => {
    setAssignments(prev => [
      ...prev,
      {
        driverId: null,
        busId: null,
        description: null
      }
    ])
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      await releasePlanService.assignReserve(date, assignments)
      toast({ title: "Сохранено", description: "Назначения сохранены" })
      setHasChanges(false)
      router.push(`/dashboard/fleet-manager/release-plan/workday/by-date/${date}`)
    } catch {
      toast({ 
        title: "Ошибка", 
        description: "Не удалось сохранить резерв", 
        variant: "destructive" 
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/workday/by-date/${date}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Резерв</h1>
          <p className="text-gray-500">{formatDateLabel(new Date(date))}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-800 text-white">
          <CardTitle>Назначения в резерв</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <div key={index} className="flex gap-4 items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Назначение #{index + 1}</p>
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="text-sm font-medium">Водитель</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded"
                        placeholder="ID водителя"
                        value={assignment.driverId || ""}
                        onChange={(e) => {
                          const newAssignments = [...assignments]
                          newAssignments[index].driverId = e.target.value || null
                          setAssignments(newAssignments)
                          setHasChanges(true)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Автобус</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded"
                        placeholder="ID автобуса"
                        value={assignment.busId || ""}
                        onChange={(e) => {
                          const newAssignments = [...assignments]
                          newAssignments[index].busId = e.target.value || null
                          setAssignments(newAssignments)
                          setHasChanges(true)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Описание</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded"
                        placeholder="Описание"
                        value={assignment.description || ""}
                        onChange={(e) => {
                          const newAssignments = [...assignments]
                          newAssignments[index].description = e.target.value || null
                          setAssignments(newAssignments)
                          setHasChanges(true)
                        }}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => {
                    setAssignments(prev => prev.filter((_, i) => i !== index))
                    setHasChanges(true)
                  }}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button onClick={handleAddAssignment}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить назначение
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 