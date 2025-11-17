import type { Metadata } from "next"
import { TodayReleaseSummary } from "./components/TodayReleaseSummary"
import { MonthlyProgress } from "./components/MonthlyProgress"
import { DispatcherShiftSummary } from "./components/DispatcherShiftSummary"
import { QuickLinks } from "./components/QuickLinks"
import { SeniorCounts } from "./components/SeniorCounts"

export const metadata: Metadata = {
  title: "Главная панель | Старший Диспетчер",
  description: "Дашборд старшего диспетчера автобусного парка",
}

export default function SeniorDispatcherDashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Главная панель</h1>
          <p className="text-muted-foreground">Добро пожаловать, Старший Диспетчер</p>
        </div>
        <div className="mt-2 md:mt-0 text-sm text-muted-foreground">
          {new Date().toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-6">
        <SeniorCounts />
        <TodayReleaseSummary />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MonthlyProgress />
          <DispatcherShiftSummary />
        </div>

        <QuickLinks />
      </div>
    </div>
  )
}
