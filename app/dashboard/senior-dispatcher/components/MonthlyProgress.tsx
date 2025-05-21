"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useMonthlyProgress } from "../hooks/useMonthlyProgress"

export function MonthlyProgress() {
  const router = useRouter()
  const { data, loading, error } = useMonthlyProgress()

  const getProgressColor = (completion: number) => {
    if (completion >= 95) return "bg-green-500"
    if (completion >= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
  }

  const handleViewMonthlyReport = () => {
    router.push("/dashboard/senior-dispatcher/reports?tab=monthly")
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Выполнение плана за месяц</CardTitle>
            <CardDescription>{getCurrentMonth()}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleViewMonthlyReport}>
            Месячный отчет
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded-md">{error}</div>}

        {loading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : data ? (
          <>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Прогресс выполнения</span>
                <span>{data.averageCompletion}%</span>
              </div>
              <Progress
                value={data.averageCompletion}
                className={`h-2 ${getProgressColor(data.averageCompletion)}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-md">
                <div className="text-sm text-slate-500">Запланировано</div>
                <div className="text-2xl font-semibold">{data.totalPlanned}</div>
                <div className="text-xs text-slate-400">автобусов</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-md">
                <div className="text-sm text-slate-500">Выпущено</div>
                <div className="text-2xl font-semibold">{data.totalReleased}</div>
                <div className="text-xs text-slate-400">автобусов</div>
              </div>
              <div
                className={`p-4 rounded-md ${
                  data.averageCompletion >= 95
                    ? "bg-green-100 text-green-800"
                    : data.averageCompletion >= 80
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <div className="text-sm opacity-80">Выполнение</div>
                <div className="text-2xl font-semibold">{data.averageCompletion}%</div>
                <div className="text-xs opacity-70">среднее за месяц</div>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
