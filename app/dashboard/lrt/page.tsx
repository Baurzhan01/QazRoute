"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LRTDashboardLineChart from "./components/LRTDashboardLineChart"
import LRTDashboardCompareChart from "./components/LRTDashboardCompareChart"
import LRTDashboardDepotLineCharts from "./components/LRTDashboardDepotLineCharts"

export default function LRTDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sky-700">Панель управления LRT</h1>

      <Tabs defaultValue="bar" className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="line">📊 По колоннам</TabsTrigger>
          <TabsTrigger value="compare">📈 Сравнение месяцев</TabsTrigger>
          <TabsTrigger value="depot">🏢 По автобусному парку</TabsTrigger>
        </TabsList>

      
        <TabsContent value="compare">
          <LRTDashboardCompareChart />
        </TabsContent>
        <TabsContent value="line">
          <LRTDashboardLineChart />
        </TabsContent>
        <TabsContent value="depot">
          <LRTDashboardDepotLineCharts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
