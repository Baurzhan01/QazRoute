"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { repairBusService } from "@/service/repairBusService"
import type { RepairRegister } from "@/types/repairBus.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function GuideRepairRegistersPage() {
  const [registers, setRegisters] = useState<RepairRegister[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [grandTotals, setGrandTotals] = useState({
    work: 0,
    spare: 0,
    all: 0,
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await repairBusService.getRegisters({ page, pageSize })
        if (res.isSuccess && res.value) {
          setRegisters(res.value.items || [])
          setTotalCount(res.value.totalCount ?? 0)
          setGrandTotals({
            work: res.value.grandTotalWorkSum ?? 0,
            spare: res.value.grandTotalSpareSum ?? 0,
            all: res.value.grandTotalAllSum ?? 0,
          })
        } else {
          setRegisters([])
          setTotalCount(0)
          setGrandTotals({ work: 0, spare: 0, all: 0 })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sky-800">Реестры ремонтов (Руководство)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Всего реестров</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-gray-900">{totalCount}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Работы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{grandTotals.work.toLocaleString("ru-RU")} ₸</div>
            <Progress value={grandTotals.all ? (grandTotals.work / grandTotals.all) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Запчасти</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{grandTotals.spare.toLocaleString("ru-RU")} ₸</div>
            <Progress value={grandTotals.all ? (grandTotals.spare / grandTotals.all) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Всего</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{grandTotals.all.toLocaleString("ru-RU")} ₸</div>
            <p className="text-xs text-muted-foreground mt-1">
              Работы {grandTotals.all ? Math.round((grandTotals.work / grandTotals.all) * 100) : 0}% • Запчасти{" "}
              {grandTotals.all ? Math.round((grandTotals.spare / grandTotals.all) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список реестров</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : registers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет данных</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-3 py-2 text-left">№ реестра</th>
                    <th className="px-3 py-2 text-left">Заявок</th>
                    <th className="px-3 py-2 text-left">Сумма работ</th>
                    <th className="px-3 py-2 text-left">Сумма запчастей</th>
                    <th className="px-3 py-2 text-left">Всего</th>
                    <th className="px-3 py-2 text-left">Период</th>
                  </tr>
                </thead>
                <tbody>
                  {registers.map((r) => (
                    <tr key={r.registerNumber} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <Link className="text-sky-600 hover:underline" href={`/dashboard/guide/repair-registers/${r.registerNumber}`}>
                          {r.registerNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{r.applicationsCount ?? 0}</td>
                      <td className="px-3 py-2">{r.totalWorkSum?.toLocaleString("ru-RU") ?? 0} ₸</td>
                      <td className="px-3 py-2">{r.totalSpareSum?.toLocaleString("ru-RU") ?? 0} ₸</td>
                      <td className="px-3 py-2 font-semibold">{r.totalAllSum?.toLocaleString("ru-RU") ?? 0} ₸</td>
                      <td className="px-3 py-2">
                        {r.firstInputDate?.slice(0, 10)} — {r.lastInputDate?.slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between mt-4 text-sm">
            <span>
              Страница {page} из {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="rounded border px-3 py-1 disabled:text-gray-400"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Назад
              </button>
              <button
                className="rounded border px-3 py-1 disabled:text-gray-400"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Вперед
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
