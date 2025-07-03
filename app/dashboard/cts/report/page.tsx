"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FileText, CalendarDays, Wrench, BarChart2, ClipboardList } from "lucide-react";

export default function RepairReportsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-sky-700 mb-6">Отчеты по ремонтам</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Все ремонты */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Все ремонты
            </CardTitle>
            <CardDescription>За выбранный день или месяц</CardDescription>
          </CardHeader>
          <CardContent className="py-4 text-sm text-gray-600">
            Просмотр автобусов, находящихся в текущем или длительном ремонте. Отчет включает VIN-коды, марку, гос. номер и техпаспорт.
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/cts/report/all")}>Открыть</Button>
          </CardFooter>
        </Card>

        {/* Неплановые ремонты */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" /> Неплановые ремонты
            </CardTitle>
            <CardDescription>За день, месяц и по колоннам</CardDescription>
          </CardHeader>
          <CardContent className="py-4 text-sm text-gray-600">
            Фиксация всех случаев непланового ремонта. Доступна фильтрация по дате и автоколонне.
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/cts/report/unscheduled")}>Открыть</Button>
          </CardFooter>
        </Card>

        {/* История по автобусу */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" /> По автобусу
            </CardTitle>
            <CardDescription>По VIN-коду или ID</CardDescription>
          </CardHeader>
          <CardContent className="py-4 text-sm text-white-600">
            Детальный отчет по конкретному автобусу. Показывает список всех ремонтов за указанный период.
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/cts/report/bus")}>Открыть</Button>
          </CardFooter>
        </Card>

        {/* Статистика по колоннам */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" /> Статистика по колоннам
            </CardTitle>
            <CardDescription>Аналитика по дню и месяцу</CardDescription>
          </CardHeader>
          <CardContent className="py-4 text-sm text-white-600">
            Количество неплановых ремонтов, выполненных в каждой автоколонне.
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/cts/report/convoy-stats")}>Открыть</Button>
          </CardFooter>
        </Card>

        {/* Частота неплановых по автобусу */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Частота ремонтов
            </CardTitle>
            <CardDescription>Частотный анализ по одному автобусу</CardDescription>
          </CardHeader>
          <CardContent className="py-4 text-sm text-white-600">
            Сколько раз автобус попадал в неплановый ремонт за выбранный период.
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/cts/report/bus-freq")}>Открыть</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}