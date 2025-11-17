"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { repairBusService } from "@/service/repairBusService"
import type { RepairRegisterDetail } from "@/types/repairBus.types"

export default function GuideRepairRegisterDetailPage() {
  const params = useParams()
  const registerNumber = params.registerNumber as string

  const [data, setData] = useState<RepairRegisterDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const totalPages = useMemo(() => {
    if (!data) return 1
    return Math.max(1, Math.ceil((data.totalCount || 0) / pageSize))
  }, [data])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await repairBusService.getByRegister(registerNumber, { page, pageSize })
        if (res.isSuccess && res.value) {
          setData(res.value)
        } else {
          setData(null)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [registerNumber, page])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sky-800">Реестр {registerNumber} (просмотр)</h1>
        <Link className="text-sm text-sky-600 hover:underline" href="/dashboard/guide/repair-registers">
          ← Ко всем реестрам
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заявки</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : !data ? (
            <p className="text-sm text-muted-foreground">Данные не найдены</p>
          ) : (
            <>
              <div className="text-sm text-gray-700 mb-3">
                Всего: {data.totalCount ?? data.applications?.length ?? 0} заявок • Работы:{" "}
                {(data.totalWorkSum ?? 0).toLocaleString("ru-RU")} ₸ • Запчасти:{" "}
                {(data.totalSpareSum ?? 0).toLocaleString("ru-RU")} ₸ • Всего:{" "}
                {(data.totalAllSum ?? 0).toLocaleString("ru-RU")} ₸
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="px-3 py-2 text-left">№ заявки</th>
                      <th className="px-3 py-2 text-left">Автобус</th>
                      <th className="px-3 py-2 text-left">Работы (₸)</th>
                      <th className="px-3 py-2 text-left">Запчасти (₸)</th>
                      <th className="px-3 py-2 text-left">Всего (₸)</th>
                      <th className="px-3 py-2 text-left">Период</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.applications || []).map((a) => (
                      <tr key={a.applicationNumber} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <Link
                            className="text-sky-600 hover:underline"
                            href={`/dashboard/mechanic/repairs/bus/${a.busId}?appNum=${a.applicationNumber}`}
                          >
                            {a.applicationNumber}
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          {a.garageNumber || "—"} / {a.govNumber || "—"}
                        </td>
                        <td className="px-3 py-2">{a.workSum.toLocaleString("ru-RU")} ₸</td>
                        <td className="px-3 py-2">{a.spareSum.toLocaleString("ru-RU")} ₸</td>
                        <td className="px-3 py-2 font-semibold">{a.allSum.toLocaleString("ru-RU")} ₸</td>
                        <td className="px-3 py-2">
                          {a.firstDepartureDate?.slice(0, 10)} — {a.lastEntryDate?.slice(0, 10)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-sm mt-4">
                <span>
                  Всего: {data.totalCount ?? data.applications?.length ?? 0} заявок • Работы:{" "}
                  {(data.totalWorkSum ?? 0).toLocaleString("ru-RU")} ₸ • Запчасти:{" "}
                  {(data.totalSpareSum ?? 0).toLocaleString("ru-RU")} ₸ • Всего:{" "}
                  {(data.totalAllSum ?? 0).toLocaleString("ru-RU")} ₸
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded border px-3 py-1 disabled:text-gray-400"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Назад
                  </button>
                  <span>
                    {page} / {totalPages}
                  </span>
                  <button
                    className="rounded border px-3 py-1 disabled:text-gray-400"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Вперед
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
