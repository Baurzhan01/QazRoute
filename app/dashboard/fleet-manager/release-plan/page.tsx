"use client";

import { useCalendar } from "./hooks/useCalendar";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MonthSelector from "./components/MonthSelector";

export default function ReleasePlanPage() {
  const { currentMonth, nextMonth, loading, goToNextMonth } = useCalendar();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/fleet-manager">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700"
          >
            План выпуска
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 mt-1"
          >
            Планирование и управление ежедневными маршрутами
          </motion.p>
        </div>
      </div>

      {loading || !currentMonth || !nextMonth ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          <MonthSelector
            currentMonth={currentMonth}
            nextMonth={nextMonth}
            onNext={goToNextMonth}
            loading={loading}
          />
          {/* 👇 Здесь можно подключить компонент с днями */}
          {/* <CalendarGrid month={currentMonth} /> */}
        </>
      )}
    </div>
  );
}
