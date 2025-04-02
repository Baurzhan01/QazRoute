"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

// Импорт типов и хуков
import type { ScheduleType, Station } from "./types"
import { useRoutes } from "./hooks/useRoutes"

// Импорт компонентов
import RouteDialog from "./components/RouteDialog"
import ScheduleTypeSection from "./components/ScheduleTypeSection"

export default function RoutesPage() {
  const router = useRouter()

  // Состояние для модальных окон
  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false)
  const [isEditRouteDialogOpen, setIsEditRouteDialogOpen] = useState(false)

  // Состояние для активной вкладки
  const [activeTab, setActiveTab] = useState<ScheduleType>("workdays")

  // Список станций (в реальном приложении должен приходить из API)
  const [stations] = useState<Station[]>([
    { id: "1", name: "1-колонна (будни)", scheduleType: "workdays" },
    { id: "2", name: "2-колонна (будни)", scheduleType: "workdays" },
    { id: "3", name: "3-колонна (будни)", scheduleType: "workdays" },
    { id: "4", name: "1-колонна (суббота)", scheduleType: "saturday" },
    { id: "5", name: "2-колонна (суббота)", scheduleType: "saturday" },
    { id: "6", name: "1-колонна (воскресенье)", scheduleType: "sunday" },
  ])

  // Инициализация хука для работы с маршрутами
  const {
    routesByScheduleType,
    selectedRoute,
    formData,
    handleFormChange,
    handleSelectChange,
    handleAddRoute,
    handleEditRoute,
    handleDeleteRoute,
    openEditRouteDialog,
  } = useRoutes([
    // Примеры маршрутов для демонстрации
    {
      id: "1",
      name: "Маршрут №1",
      exitNumbers: "101, 102, 103",
      orderInSchedule: "1",
      additionalInfo: "Основной маршрут",
      station: "1",
      scheduleType: "workdays",
    },
    {
      id: "2",
      name: "Маршрут №2",
      exitNumbers: "201, 202",
      orderInSchedule: "2",
      additionalInfo: "Дополнительный маршрут",
      station: "2",
      scheduleType: "workdays",
    },
    {
      id: "3",
      name: "Маршрут №3",
      exitNumbers: "301",
      orderInSchedule: "1",
      additionalInfo: "Субботний маршрут",
      station: "4",
      scheduleType: "saturday",
    },
    {
      id: "4",
      name: "Маршрут №4",
      exitNumbers: "401",
      orderInSchedule: "1",
      additionalInfo: "Воскресный маршрут",
      station: "6",
      scheduleType: "sunday",
    },
  ])

  // Обработчики для диалоговых окон
  const handleOpenAddRouteDialog = (scheduleType: ScheduleType) => {
    // Находим первую станцию для выбранного типа расписания
    const defaultStation = stations.find((s) => s.scheduleType === scheduleType)

    // Устанавливаем начальные значения формы
    formData.scheduleType = scheduleType
    formData.station = defaultStation?.id || ""

    setIsAddRouteDialogOpen(true)
  }

  const handleSubmitAddRoute = () => {
    if (handleAddRoute()) {
      setIsAddRouteDialogOpen(false)
    }
  }

  const handleOpenEditRouteDialog = (route) => {
    openEditRouteDialog(route)
    setIsEditRouteDialogOpen(true)
  }

  const handleSubmitEditRoute = () => {
    if (handleEditRoute()) {
      setIsEditRouteDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-sky-700">Управление маршрутами</h1>
          <p className="text-gray-500 mt-1">Добавление и редактирование маршрутов для разных типов расписания</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ScheduleType)} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="workdays" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Будни
              </TabsTrigger>
              <TabsTrigger value="saturday" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Суббота
              </TabsTrigger>
              <TabsTrigger value="sunday" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Воскресенье
              </TabsTrigger>
            </TabsList>

            <Button onClick={() => handleOpenAddRouteDialog(activeTab)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить маршрут
            </Button>
          </div>
        </Tabs>
      </div>

      <TabsContent value="workdays" className="mt-6">
        <ScheduleTypeSection
          title="Маршруты"
          scheduleType="workdays"
          routes={routesByScheduleType.workdays}
          onAddRoute={handleOpenAddRouteDialog}
          onEditRoute={handleOpenEditRouteDialog}
          onDeleteRoute={handleDeleteRoute}
        />
      </TabsContent>

      <TabsContent value="saturday" className="mt-6">
        <ScheduleTypeSection
          title="Маршруты"
          scheduleType="saturday"
          routes={routesByScheduleType.saturday}
          onAddRoute={handleOpenAddRouteDialog}
          onEditRoute={handleOpenEditRouteDialog}
          onDeleteRoute={handleDeleteRoute}
        />
      </TabsContent>

      <TabsContent value="sunday" className="mt-6">
        <ScheduleTypeSection
          title="Маршруты"
          scheduleType="sunday"
          routes={routesByScheduleType.sunday}
          onAddRoute={handleOpenAddRouteDialog}
          onEditRoute={handleOpenEditRouteDialog}
          onDeleteRoute={handleDeleteRoute}
        />
      </TabsContent>

      {/* Диалоговые окна */}
      <RouteDialog
        open={isAddRouteDialogOpen}
        onOpenChange={setIsAddRouteDialogOpen}
        title="Добавить маршрут"
        description="Заполните информацию о новом маршруте"
        formData={formData}
        stations={stations.filter((s) => s.scheduleType === formData.scheduleType)}
        onFormChange={handleFormChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSubmitAddRoute}
        submitLabel="Добавить"
      />

      <RouteDialog
        open={isEditRouteDialogOpen}
        onOpenChange={setIsEditRouteDialogOpen}
        title="Редактировать маршрут"
        description="Измените информацию о маршруте"
        formData={formData}
        stations={stations.filter((s) => s.scheduleType === formData.scheduleType)}
        onFormChange={handleFormChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSubmitEditRoute}
        submitLabel="Сохранить"
      />
    </div>
  )
}

    