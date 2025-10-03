"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { getAuthData } from "@/lib/auth-utils"
import { coordinatorService } from "@/service/coordinatorService"
import type { ConvoyCoordinatorCard } from "@/types/coordinator.types"

export function TodayReleaseSummary() {
  const [convoys, setConvoys] = useState<ConvoyCoordinatorCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const auth = getAuthData()

        if (!auth?.busDepotId) {
          setError("Не удалось получить информацию о пользователе")
          setLoading(false)
          return
        }

        const date = new Date().toISOString().split("T")[0]
        const response = await coordinatorService.getConvoysByDepot(auth.busDepotId, date)
        setConvoys(response.value || [])
        setError(null)
      } catch (err) {
        console.error(err)
        setError("Ошибка при загрузке данных о выпуске автобусов")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCompletionColor = (completion: number) => {
    if (completion >= 95) return "bg-green-100 text-green-800"
    if (completion >= 80) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getTotalStats = () => {
    const planned = convoys.reduce((sum, c) => sum + (c.planned ?? 0), 0)
    const released = convoys.reduce((sum, c) => sum + (c.released ?? 0), 0)
    const completion = planned > 0 ? Math.round((released / planned) * 100) : 0
    return { planned, released, completion }
  }

  const totals = getTotalStats()

  const handleViewDailyReport = () => {
    router.push("/dashboard/senior-dispatcher/reports?tab=daily")
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Выпуск автобусов на сегодня</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleViewDailyReport}
          >
            Дневной отчет
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded-md">{error}</div>}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm text-slate-500">Запланировано</div>
            <div className="text-2xl font-semibold">{totals.planned}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm text-slate-500">Выпущено</div>
            <div className="text-2xl font-semibold">{totals.released}</div>
          </div>
          <div className={`p-3 rounded-md ${getCompletionColor(totals.completion)}`}>
            <div className="text-sm opacity-80">Выполнение</div>
            <div className="text-2xl font-semibold">{totals.completion}%</div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Автоколонна</TableHead>
                <TableHead className="text-right">Запланировано</TableHead>
                <TableHead className="text-right">Выпущено</TableHead>
                <TableHead className="text-right">Выполнение</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-10 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-10 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                : convoys.map((convoy) => {
                    const planned = convoy.planned ?? 0
                    const released = convoy.released ?? 0
                    const completion =
                      convoy.completion ?? (planned > 0 ? Math.round((released / planned) * 100) : 0)

                    return (
                      <TableRow
                        key={convoy.convoyId}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() =>
                          router.push(
                            `/dashboard/senior-dispatcher/reports/daily/${convoy.convoyId}?date=${
                              new Date().toISOString().split("T")[0]
                            }`
                          )
                        }
                      >
                        <TableCell className="font-medium">{convoy.convoyName}</TableCell>
                        <TableCell className="text-right">{planned}</TableCell>
                        <TableCell className="text-right">{released}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${getCompletionColor(
                              completion
                            )}`}
                          >
                            {completion}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
