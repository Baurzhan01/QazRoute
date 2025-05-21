"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, UserCheck, UserX, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useDispatcherShiftSummary } from "../hooks/useDispatcherShiftSummary"

export function DispatcherShiftSummary() {
  const { data, loading, error } = useDispatcherShiftSummary()
  const router = useRouter()

  const handleViewDispatchers = () => {
    router.push("/dashboard/senior-dispatcher/dispatchers")
  }

  const handleViewShiftTable = () => {
    router.push("/dashboard/senior-dispatcher/shift-table")
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Сводка по диспетчерам</CardTitle>
            <CardDescription>Текущий статус</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleViewDispatchers}>
              Диспетчеры
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewShiftTable}>
              Табель
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded-md">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-md text-center">
                <UserCheck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-semibold text-blue-700">{data.onShift}</div>
                <div className="text-sm text-blue-600">На смене</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-md text-center">
                <UserX className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-semibold text-amber-700">{data.dayOff}</div>
                <div className="text-sm text-amber-600">Выходной</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-md text-center">
                <Briefcase className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-semibold text-emerald-700">{data.vacation}</div>
                <div className="text-sm text-emerald-600">В отпуске</div>
              </div>
            </div>

            {data.shiftInfo && (
              <div className="mt-4 p-3 bg-slate-50 rounded-md">
                <div className="text-sm text-slate-500 mb-2">Текущая смена</div>
                <div className="text-sm">
                  <span className="font-medium">{data.shiftInfo.name}:</span>{" "}
                  {data.shiftInfo.start} - {data.shiftInfo.end}
                </div>
                {data.shiftInfo.dispatchers.length > 0 && (
                  <div className="text-sm mt-1">
                    <span className="font-medium">Диспетчеры на смене:</span>{" "}
                    {data.shiftInfo.dispatchers.join(", ")}
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
