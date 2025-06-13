"use client"

import { useState, useEffect } from "react"
import { shiftTableService } from "@/service/shiftTableService"
import { exportToExcel, exportToPdf } from "../utils/exportShiftTable"
import { apiToShift } from "../utils/shiftTypeMapper"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

import { ShiftTableHeader } from "./ShiftTableHeader"
import { ShiftTableRow } from "./ShiftTableRow"
import { ShiftExportButtons } from "./ShiftExportButtons"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import type { UserWorkShift, WorkShiftType } from "@/types/coordinator.types"
import type { MonthData } from "../types/shift.types"
import { getAuthData } from "@/lib/auth-utils"

export const ShiftTable = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [shifts, setShifts] = useState<UserWorkShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noData, setNoData] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const auth = getAuthData()
  const depotId = auth?.busDepotId ?? ""

  const monthData: MonthData = {
    year,
    month,
    daysInMonth: new Date(year, month, 0).getDate(),
  }

  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ]

  const loadShiftTable = async () => {
    setLoading(true)
    setError(null)
    setNoData(false)

    try {
      const result = await shiftTableService.getShiftTable(year, month)
      if (result.isSuccess && result.value?.length) {
        setShifts(result.value)
      } else {
        setNoData(true)
        setShifts([])
      }
    } catch (err) {
      setError("Не удалось загрузить табель")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShiftTable()
  }, [year, month, depotId])

  const handleGenerateTable = async () => {
    setIsCreating(true)
    try {
      await shiftTableService.generateMonthlyShift(depotId, year, month)
      await loadShiftTable()
    } catch (err) {
      setError("Не удалось создать табель")
    } finally {
      setIsCreating(false)
    }
  }  

  const handleShiftUpdate = async (dispatcherId: string, date: string, shiftType: WorkShiftType) => {
    try {
      await shiftTableService.updateShift(dispatcherId, date, shiftType)
      setShifts((prev) =>
        prev.map((user) =>
          user.userId === dispatcherId
            ? {
                ...user,
                days: user.days.map((d) =>
                  d.date === date ? { ...d, shiftType } : d
                ),
              }
            : user
        )
      )
    } catch (err) {
      console.error("Ошибка при обновлении смены:", err)
    }
  }

  const handleExportExcel = async () => {
    try {
      await exportToExcel(shifts, monthData)
    } catch (error) {
      console.error('Ошибка при экспорте в Excel:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать данные в Excel",
        variant: "destructive"
      })
    }
  }
  const handleExportPdf = () => exportToPdf(shifts, monthData)
  const handlePrint = () => window.print()

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <CardTitle>Табель по сменам</CardTitle>

        <div className="flex flex-wrap gap-2 items-center">
          <Select value={year.toString()} onValueChange={(v) => setYear(+v)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Год" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={month.toString()} onValueChange={(v) => setMonth(+v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Месяц" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((m, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ShiftExportButtons
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            disabled={loading || !!error || noData}
          />
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {noData && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Табель на {monthNames[month - 1]} {year} не создан.</p>
            <Button onClick={handleGenerateTable} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать табель"
              )}
            </Button>
          </div>
        )}
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          !noData && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <ShiftTableHeader monthData={monthData} />
                <tbody>
                  {shifts.map((user) => (
                    <ShiftTableRow
                      key={user.userId}
                      dispatcher={{
                        dispatcherId: user.userId,
                        fullName: user.fullName,
                        shifts: user.days.map((d) => ({
                          date: d.date,
                          shift: apiToShift(d.shiftType),
                        })),
                      }}
                      monthData={monthData}
                      onShiftUpdate={handleShiftUpdate}
                      isLoading={false}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
