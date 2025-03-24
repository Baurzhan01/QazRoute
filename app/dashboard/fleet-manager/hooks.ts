"use client"

import { useState, useEffect } from "react"
import { analyticsService, busService } from "@/app/api/apiService"
import type {
  FleetStats,
  FleetStatus,
  FuelConsumption,
  MaintenanceStatus,
  Alert,
  ScheduleItem,
  Bus,
} from "@/app/api/types"

// Хук для получения статистики автопарка
export function useFleetStats() {
  const [data, setData] = useState<FleetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const stats = await analyticsService.getFleetStats()
        setData(stats)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Неизвестная ошибка"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

// Хук для получения статуса автопарка
export function useFleetStatus() {
  const [data, setData] = useState<FleetStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const status = await analyticsService.getFleetStatus()
        setData(status)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Неизвестная ошибка"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

// Хук для получения данных о расходе топлива
// Пока используем моковые данные, так как в API нет этой информации
export function useFuelConsumption() {
  const [data, setData] = useState<FuelConsumption | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Имитация задержки API
        await new Promise((resolve) => setTimeout(resolve, 700))
        setData({
          thisMonth: 12450,
          lastMonth: 13200,
          efficiency: 5.7,
        })
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Неизвестная ошибка"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

// Хук для получения статуса технического обслуживания
export function useMaintenanceStatus() {
  const [data, setData] = useState<MaintenanceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Получаем все автобусы
        const busesResponse = await busService.getAll()

        if (busesResponse.isSuccess && busesResponse.value) {
          const buses = busesResponse.value

          // Анализируем статус ТО
          const completed = buses.filter((bus) => bus.busStatus === "MaintenanceCompleted").length
          const scheduled = buses.filter((bus) => bus.busStatus === "MaintenanceScheduled").length
          const overdue = buses.filter((bus) => bus.busStatus === "MaintenanceOverdue").length

          setData({
            completed,
            scheduled,
            scheduled,
            overdue,
          })
        } else {
          // Если API не вернуло данные, используем моковые
          setData({
            completed: 24,
            scheduled: 7,
            overdue: 3,
          })
        }

        setLoading(false)
      } catch (err) {
        console.error("Ошибка при получении статуса ТО:", err)
        // В случае ошибки используем моковые данные
        setData({
          completed: 24,
          scheduled: 7,
          overdue: 3,
        })
        setError(err instanceof Error ? err : new Error("Неизвестная ошибка"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

// Хук для получения последних оповещений
export function useRecentAlerts() {
  const [data, setData] = useState<Alert[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Получаем автобусы с проблемами
        const busesResponse = await busService.getAll()

        if (busesResponse.isSuccess && busesResponse.value) {
          const buses = busesResponse.value

          // Создаем оповещения на основе статуса автобусов
          const alerts: Alert[] = []

          buses.forEach((bus, index) => {
            if (bus.busStatus === "MaintenanceRequired") {
              alerts.push({
                id: `bus-${bus.id}`,
                severity: "high",
                title: `Автобус #${bus.garageNumber} требует ТО`,
                description: `Обнаружена неисправность. Требуется техническое обслуживание.`,
                timestamp: "Сегодня, 10:45",
              })
            } else if (bus.busStatus === "MaintenanceScheduled") {
              alerts.push({
                id: `schedule-${bus.id}`,
                severity: "medium",
                title: `Плановое ТО для автобуса #${bus.garageNumber}`,
                description: `Запланировано техническое обслуживание.`,
                timestamp: "Сегодня, 9:30",
              })
            }
          })

          // Если нет реальных оповещений, добавляем моковые
          if (alerts.length === 0) {
            alerts.push(
              {
                id: "1",
                severity: "high",
                title: "Автобус #103 требует ТО",
                description: "Обнаружена неисправность двигателя. Требуется техническое обслуживание.",
                timestamp: "Сегодня, 10:45",
              },
              {
                id: "2",
                severity: "medium",
                title: "Задержка на маршруте #7",
                description: "Сообщается о пробке. Ожидается задержка 15 минут.",
                timestamp: "Сегодня, 9:30",
              },
              {
                id: "3",
                severity: "medium",
                title: "Нехватка водителей",
                description: "3 водителя сообщили о болезни. Требуется перераспределение.",
                timestamp: "Вчера, 18:15",
              },
            )
          }

          setData(alerts.slice(0, 3)) // Ограничиваем до 3 оповещений
        } else {
          // Если API не вернуло данные, используем моковые
          setData([
            {
              id: "1",
              severity: "high",
              title: "Автобус #103 требует ТО",
              description: "Обнаружена неисправность двигателя. Требуется техническое обслуживание.",
              timestamp: "Сегодня, 10:45",
            },
            {
              id: "2",
              severity: "medium",
              title: "Задержка на маршруте #7",
              description: "Сообщается о пробке. Ожидается задержка 15 минут.",
              timestamp: "Сегодня, 9:30",
            },
            {
              id: "3",
              severity: "medium",
              title: "Нехватка водителей",
              description: "3 водителя сообщили о болезни. Требуется перераспределение.",
              timestamp: "Вчера, 18:15",
            },
          ])
        }

        setLoading(false)
      } catch (err) {
        console.error("Ошибка при получении оповещений:", err)
        // В случае ошибки используем моковые данные
        setData([
          {
            id: "1",
            severity: "high",
            title: "Автобус #103 требует ТО",
            description: "Обнаружена неисправность двигателя. Требуется техническое обслуживание.",
            timestamp: "Сегодня, 10:45",
          },
          {
            id: "2",
            severity: "medium",
            title: "Задержка на маршруте #7",
            description: "Сообщается о пробке. Ожидается задержка 15 минут.",
            timestamp: "Сегодня, 9:30",
          },
          {
            id: "3",
            severity: "medium",
            title: "Нехватка водителей",
            description: "3 водителя сообщили о болезни. Требуется перераспределение.",
            timestamp: "Вчера, 18:15",
          },
        ])
        setError(err instanceof Error ? err : new Error("Неизвестная ошибка"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

// Хук для получения предстоящего расписания
export function useUpcomingSchedule() {
  const [data, setData] = useState<ScheduleItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Пока используем моковые данные, так как в API нет этой информации
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setData([
          {
            id: "1",
            title: "Инспекция автопарка",
            description: "Квартальная проверка всех рабочих автобусов",
            date: "Завтра, 9:00",
            icon: "clock",
          },
          {
            id: "2",
            title: "Совещание по бюджету",
            description: "Обзор бюджета Q2 и распределение ресурсов",
            date: "23 марта, 14:00",
            icon: "file",
          },
          {
            id: "3",
            title: "Тренинг для водителей",
            description: "Обучение по протоколам безопасности и экономии топлива",
            date: "25 марта, 10:00",
            icon: "users",
          },
        ])
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Неизвестная ошибка"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

// Хук для получения списка автобусов
export function useBuses() {
  const [data, setData] = useState<Bus[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await busService.getAll()

        if (response.isSuccess && response.value) {
          setData(response.value)
        } else {
          throw new Error(response.error || "Не удалось получить данные об автобусах")
        }

        setLoading(false)
      } catch (err) {
        console.error("Ошибка при получении списка автобусов:", err)
        setError(err instanceof Error ? err : new Error("Неизвестная ошибка"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

