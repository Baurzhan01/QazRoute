"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Save, UsersRound } from "lucide-react"
import Link from "next/link"
import { formatDateLabel, parseDate } from "../../../../utils/dateUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import type { ReserveDeparture, Bus, Driver } from "./types"
import { MOCK_BUSES, ASSIGNED_DRIVERS, ASSIGNED_BUSES, INITIAL_RESERVE_DEPARTURES } from "./mockData"
import ReserveTable from "./components/ReserveTable"
import AssignmentDialog from "./components/AssignmentDialog"

export default function ReserveDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const dateString = params.date as string
  const dayType = params.dayType as string

  // Memoize the date object to prevent recreation on each render
  const date = useMemo(() => parseDate(dateString), [dateString])

  const [departures, setDepartures] = useState<ReserveDeparture[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDeparture, setSelectedDeparture] = useState<ReserveDeparture | null>(null)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [driverSearchQuery, setDriverSearchQuery] = useState("")
  const [busSearchQuery, setBusSearchQuery] = useState("")

  // Инициализация данных
  useEffect(() => {
    // Загружаем начальные данные
    setDepartures(INITIAL_RESERVE_DEPARTURES)
  }, [])

  // Получаем список доступных автобусов (не назначенных на маршруты)
  const availableBuses = useMemo(() => {
    return MOCK_BUSES.filter((bus) => !ASSIGNED_BUSES.includes(bus.id))
  }, [])

  // Фильтрация автобусов по поисковому запросу
  const filteredBuses = useMemo(() => {
    if (!busSearchQuery) return availableBuses

    return availableBuses.filter(
      (bus) =>
        bus.garageNumber.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
        bus.stateNumber.toLowerCase().includes(busSearchQuery.toLowerCase()),
    )
  }, [availableBuses, busSearchQuery])

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
  const handleOpenAddDialog = (departure: ReserveDeparture) => {
    setSelectedDeparture(departure)
    setSelectedBus(null)
    setSelectedDriver(null)
    setBusSearchQuery("")
    setDriverSearchQuery("")
    setIsAddDialogOpen(true)
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
      description: `Автобус ${selectedBus.garageNumber} назначен в резерв #${selectedDeparture.sequenceNumber}`,
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
  const handleSaveAll = () => {
    // Здесь должен быть API запрос для сохранения плана
    // В данном примере просто показываем уведомление и перенаправляем на страницу маршрутов
    toast({
      title: "Успешно",
      description: "Все изменения сохранены",
    })

    // Добавляем небольшую задержку перед перенаправлением
    setTimeout(() => {
      router.push(`/dashboard/fleet-manager/release-plan/${dayType}/${dateString}`)
    }, 1500)
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">Резерв водителей</h1>
          <p className="text-gray-500 mt-1">{formatDateLabel(date)}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="bg-gray-800 text-white">
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5" />
              Резерв водителей
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ReserveTable
              departures={departures}
              onAddAssignment={handleOpenAddDialog}
              onRemoveAssignment={handleRemoveAssignment}
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
      </motion.div>
    </div>
  )
}

