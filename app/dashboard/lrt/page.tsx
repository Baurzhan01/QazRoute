"use client"

import LRTDashboardChart from "./components/LRTDashboardChart"

export default function LRTDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sky-700">Панель управления LRT</h1>
      <LRTDashboardChart />
    </div>
  )
}
