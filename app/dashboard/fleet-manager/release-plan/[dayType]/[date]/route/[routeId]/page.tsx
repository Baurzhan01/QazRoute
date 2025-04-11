"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Save, BusIcon } from "lucide-react"
import Link from "next/link"
import { useRouteDetails } from "../../../../hooks/usePlanByDay"
import { formatDateLabel, parseDate } from "../../../../utils/dateUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import type { Departure, Bus, Driver, Schedule } from "./types"
import { MOCK_BUSES, ASSIGNED_DRIVERS, INITIAL_DEPARTURES, MOCK_SCHEDULES } from "./mockData"
import DepartureTable from "./components/DepartureTable"
import AssignmentDialog from "./components/AssignmentDialog"
import TimeEditModal from "./components/TimeEditModal"
import SecondShiftModal from "./components/SecondShiftModal"
import EditAssignmentModal from "./components/EditAssignmentModal"

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.routeId as string
  const dateString = params.date as string
  const dayType = params.dayType as string

  // Memoize the date object to prevent recreation on each render
  const date = useMemo(() => parseDate(dateString), [dateString])

  const { routeDetails, loading, error } = useRouteDetails(routeId, date)
  const [departures, setDepartures] = useState<Departure[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTimeEditModalOpen, setIsTimeEditModalOpen] = useState(false)
  const [isSecondShiftModalOpen, setIsSecondShiftModalOpen] = useState(false)
  const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false)
  const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [driverSearchQuery, setDriverSearchQuery] = useState("")
  const [busSearchQuery, setBusSearchQuery] = useState("")
  const [timeEditType, setTimeEditType] = useState<"departureTime" | "scheduleTime" | "endTime">("departureTime")
  const [currentTimeValue, setCurrentTimeValue] = useState("")
  const [schedules, setSchedules] = useState<Schedule[]>([])

  // Инициализация данных
  useEffect(() => {
    // Загружаем начальные данные
    setDepartures(INITIAL_DEPARTURES)
    setSchedules(MOCK_SCHEDULES)

    // В реальном приложении здесь будет загрузка данных из API
    // const fetchSchedules = async () => {
    //   try {
    //     const response = await releasePlanService.getSchedules(routeId);
    //     if (response.isSuccess && response.value) {
    //       setSchedules(response.value);
    //     }
    //   } catch (error) {
    //     console.error("Ошибка при загрузке графиков:", error);
    //   }
    // };
    // fetchSchedules();
  }, [routeId])

  // Фильтрация автобусов по поисковому запросу
  const filteredBuses = useMemo(() => {
    if (!busSearchQuery) return MOCK_BUSES

    return MOCK_BUSES.filter(
      (bus) =>
        bus.garageNumber.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
        bus.stateNumber.toLowerCase().includes(busSearchQuery.toLowerCase()),
    )
  }, [busSearchQuery])

  // Фильтрация водителей по поисковому запросу
  const filteredDrivers = useMemo(() => {
    if (!selectedBus) return []

    let drivers = selectedBus.drivers

    if (driverSearchQuery) {
      drivers = drivers.filter(
        (driver) =>
          driver.personnelNumber.includes(driverSearchQuery) ||
          driver.fullName.toLowerCase().includes(driverSearchQuery.toLowerCase()),
      )
    }

    // Проверяем, назначен ли водитель на другой маршрут
    return drivers.map((driver) => {
      const assignedDriver = ASSIGNED_DRIVERS.find((d) => d.personnelNumber === driver.personnelNumber)
      if (assignedDriver) {
        return {
          ...driver,
          isAssigned: true,
          assignedRoute: assignedDriver.assignedRoute,
          assignedDeparture: assignedDriver.assignedDeparture,
        }
      }
      return driver
    })
  }, [selectedBus, driverSearchQuery])

  // Открытие диалога добавления автобуса и водителя
  const handleOpenAddDialog = (departure: Departure) => {
    setSelectedDeparture(departure)
    setSelectedBus(null)
    setSelectedDriver(null)
    setBusSearchQuery("")
    setDriverSearchQuery("")
    setIsAddDialogOpen(true)
  }

  // Открытие модального окна редактирования времени
  const handleOpenTimeEditModal = (departure: Departure, type: "departureTime" | "scheduleTime" | "endTime") => {
    setSelectedDeparture(departure)
    setTimeEditType(type)
    setCurrentTimeValue(departure[type])
    setIsTimeEditModalOpen(true)
  }

  // Открытие модального окна добавления второй смены
  const handleOpenSecondShiftModal = (departure: Departure) => {
    setSelectedDeparture(departure)
    setIsSecondShiftModalOpen(true)
  }

  // Открытие модального окна редактирования назначения
  const handleOpenEditAssignmentModal = (departure: Departure) => {
    setSelectedDeparture(departure)
    setIsEditAssignmentModalOpen(true)
  }

  // Выбор автобуса
  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus)
    setSelectedDriver(null)
    setDriverSearchQuery("")
  }

  // Выбор водителя
  const handleSelectDriver = (driver: Driver) => {
    // Проверяем, не назначен ли водитель на другой маршрут
    if (driver.isAssigned) {
      toast({
        title: "Водитель уже назначен",
        description: `Водитель ${driver.fullName} уже назначен на маршрут ${driver.assignedRoute}, выход ${driver.assignedDeparture}`,
        variant: "destructive",
      })
      return
    }

    setSelectedDriver(driver)
  }

  // Сохранение назначения
  const handleSaveAssignment = () => {
    if (!selectedDeparture || !selectedBus) {
      toast({
        title: "Ошибка",
        description: "Выберите автобус",
        variant: "destructive",
      })
      return
    }

    // Обновляем выход с выбранным автобусом и водителем
    setDepartures((prev) =>
      prev.map((dep) => {
        if (dep.id === selectedDeparture.id) {
          return {
            ...dep,
            bus: selectedBus,
            driver: selectedDriver || undefined,
          }
        }
        return dep
      }),
    )

    setIsAddDialogOpen(false)

    toast({
      title: "Успешно",
      description: `Автобус ${selectedBus.garageNumber} назначен на выход ${selectedDeparture.departureNumber}`,
    })
  }

  // Сохранение времени
  const handleSaveTime = (time: string) => {
    if (!selectedDeparture) return

    setDepartures((prev) =>
      prev.map((dep) => {
        if (dep.id === selectedDeparture.id) {
          return {
            ...dep,
            [timeEditType]: time,
          }
        }
        return dep
      }),
    )

    // В реальном приложении здесь будет API запрос
    // try {
    //   await releasePlanService.updateDepartureTime(routeId, dateString, selectedDeparture.id, time);
    // } catch (error) {
    //   console.error("Ошибка при обновлении времени:", error);
    // }

    toast({
      title: "Успешно",
      description: "Время обновлено",
    })
  }

  // Сохранение второй смены
  const handleSaveSecondShift = (driverId: string, shiftChangeTime: string) => {
    if (!selectedDeparture) return

    // Находим водителя по ID
    const driver = MOCK_BUSES.flatMap((bus) => bus.drivers).find((d) => d.id === driverId)

    if (!driver) {
      toast({
        title: "Ошибка",
        description: "Водитель не найден",
        variant: "destructive",
      })
      return
    }

    // Обновляем выход с водителем второй смены
    setDepartures((prev) =>
      prev.map((dep) => {
        if (dep.id === selectedDeparture.id) {
          return {
            ...dep,
            shift2Driver: driver,
            shift2Time: shiftChangeTime,
          }
        }
        return dep
      }),
    )

    // В реальном приложении здесь будет API запрос
    // try {
    //   await releasePlanService.addSecondShift(
    //     routeId,
    //     dateString,
    //     selectedDeparture.id,
    //     driverId,
    //     shiftChangeTime
    //   );
    // } catch (error) {
    //   console.error("Ошибка при добавлении второй смены:", error);
    // }

    toast({
      title: "Успешно",
      description: `Водитель ${driver.fullName} назначен на вторую смену`,
    })
  }

  // Обновление назначения
  const handleUpdateAssignment = (updatedDeparture: Departure) => {
    setDepartures((prev) =>
      prev.map((dep) => {
        if (dep.id === updatedDeparture.id) {
          return updatedDeparture
        }
        return dep
      }),
    )

    toast({
      title: "Успешно",
      description: "Назначение обновлено",
    })
  }

  // Удаление назначения
  const handleRemoveAssignment = (departureId: string) => {
    setDepartures((prev) =>
      prev.map((dep) => {
        if (dep.id === departureId) {
          return {
            ...dep,
            bus: undefined,
            driver: undefined,
            shift2Driver: undefined,
            shift2Time: undefined,
          }
        }
        return dep
      }),
    )

    toast({
      title: "Успешно",
      description: "Назначение удалено",
    })
  }

  // Сохранение всех изменений
  const handleSaveAll = async () => {
    try {
      // В реальном приложении здесь будет API запрос
      // const assignments = departures.map(dep => ({
      //   id: dep.id,
      //   busId: dep.bus?.id,
      //   garageNumber: dep.bus?.garageNumber,
      //   govNumber: dep.bus?.stateNumber,
      //   driver: dep.driver ? {
      //     driverId: dep.driver.id,
      //     personnelNumber: dep.driver.personnelNumber,
      //     firstName: dep.driver.fullName.split(' ')[0],
      //     lastName: dep.driver.fullName.split(' ')[1],
      //     shifts: [{
      //       shiftNumber: 1,
      //       departureTime: dep.departureTime,
      //       scheduleTime: dep.scheduleTime,
      //       additionalInfo: dep.additionalInfo
      //     }]
      //   } : undefined,
      //   shift2Driver: dep.shift2Driver ? {
      //     driverId: dep.shift2Driver.id,
      //     personnelNumber: dep.shift2Driver.personnelNumber,
      //     firstName: dep.shift2Driver.fullName.split(' ')[0],
      //     lastName: dep.shift2Driver.fullName.split(' ')[1],
      //     shifts: [{
      //       shiftNumber: 2,
      //       departureTime: dep.shift2Time || "",
      //       scheduleTime: "",
      //       additionalInfo: dep.shift2AdditionalInfo
      //     }]
      //   } : undefined,
      //   isReserve: false,
      //   endTime: dep.endTime,
      //   departureNumber: dep.departureNumber
      // }));

      // await releasePlanService.saveRouteAssignments(routeId, dateString, assignments);

      toast({
        title: "Успешно",
        description: "Все изменения сохранены",
      })

      // Добавляем небольшую задержку перед перенаправлением
      setTimeout(() => {
        router.push(`/dashboard/fleet-manager/release-plan/${dayType}/${dateString}`)
      }, 1500)
    } catch (error) {
      console.error("Ошибка при сохранении плана:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении плана",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/${dateString}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-700">
            {routeDetails ? `Маршрут № ${routeDetails.number}` : "Маршрут № 1"}
          </h1>
          <p className="text-gray-500 mt-1">
            {routeDetails?.name ? routeDetails.name : "Вокзал - Речной порт"}, {formatDateLabel(date)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Ошибка загрузки данных маршрута: {error.message}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <BusIcon className="h-5 w-5" />
                План выходов на маршрут
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DepartureTable
                departures={departures}
                onAddBus={handleOpenAddDialog}
                onRemoveAssignment={handleRemoveAssignment}
                onEditAssignment={handleOpenEditAssignmentModal}
                onAddSecondShift={handleOpenSecondShiftModal}
                onEditTime={handleOpenTimeEditModal}
              />
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button className="gap-2" onClick={handleSaveAll}>
              <Save className="h-4 w-4" />
              Сохранить изменения
            </Button>
          </div>

          {/* Диалог добавления автобуса и водителя */}
          <AssignmentDialog
            open={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSave={handleSaveAssignment}
            selectedDeparture={selectedDeparture}
            selectedBus={selectedBus}
            selectedDriver={selectedDriver}
            filteredBuses={filteredBuses}
            filteredDrivers={filteredDrivers}
            busSearchQuery={busSearchQuery}
            driverSearchQuery={driverSearchQuery}
            onBusSearchChange={setBusSearchQuery}
            onDriverSearchChange={setDriverSearchQuery}
            onSelectBus={handleSelectBus}
            onSelectDriver={handleSelectDriver}
          />

          {/* Модальное окно редактирования времени */}
          <TimeEditModal
            isOpen={isTimeEditModalOpen}
            onClose={() => setIsTimeEditModalOpen(false)}
            onSave={handleSaveTime}
            currentTime={currentTimeValue}
            title={
              timeEditType === "departureTime"
                ? "Редактирование времени выхода"
                : timeEditType === "scheduleTime"
                  ? "Редактирование времени по графику"
                  : "Редактирование времени конца работы"
            }
          />

          {/* Модальное окно добавления второй смены */}
          <SecondShiftModal
            isOpen={isSecondShiftModalOpen}
            onClose={() => setIsSecondShiftModalOpen(false)}
            departure={selectedDeparture}
            availableDrivers={MOCK_BUSES.flatMap((bus) => bus.drivers)}
            onSave={handleSaveSecondShift}
            schedules={schedules}
          />

          {/* Модальное окно редактирования назначения */}
          <EditAssignmentModal
            isOpen={isEditAssignmentModalOpen}
            onClose={() => setIsEditAssignmentModalOpen(false)}
            departure={selectedDeparture}
            availableBuses={MOCK_BUSES}
            availableDrivers={MOCK_BUSES.flatMap((bus) => bus.drivers)}
            onSave={handleUpdateAssignment}
          />
        </motion.div>
      )}
    </div>
  )
}

