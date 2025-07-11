"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { useDispatchRepairStats } from "@/hooks/useDispatchRepairStats"
import { getAuthData } from "@/lib/auth-utils"
import { useEffect, useState } from "react"

export default function LRTDashboardChart() {
  const [depotId, setDepotId] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const auth = getAuthData()
    if (auth?.busDepotId) {
      setDepotId(auth.busDepotId)

      const now = new Date()
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
      const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-30`

      setStartDate(start)
      setEndDate(end)
    }
  }, [])

  const { data, isLoading, error } =
    useDispatchRepairStats(depotId, startDate, endDate)

  if (!depotId || !startDate || !endDate) return <p>Загрузка...</p>
  if (isLoading) return <p>Загрузка данных...</p>
  if (error || !data) return <p>Ошибка загрузки данных</p>

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-sky-700">
        Неплановые ремонты по колоннам (Июль {new Date().getFullYear()})
      </h2>
      <p className="mb-2 text-muted-foreground">Всего: {data.total}</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.items}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="convoyNumber" label={{ value: "Автоколонна", position: "insideBottom", offset: -5 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="repairs" name="Сходы / ремонты" fill="#38bdf8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
