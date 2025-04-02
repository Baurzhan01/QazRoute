import type { ScheduleType } from "../types"

// Функция для получения названия типа расписания
export const getScheduleTypeName = (scheduleType: ScheduleType): string => {
  switch (scheduleType) {
    case "workdays":
      return "Будни"
    case "saturday":
      return "Суббота"
    case "sunday":
      return "Воскресенье"
    default:
      return "Неизвестно"
  }
}

// Функция для получения цвета фона карточки в зависимости от типа расписания
export const getScheduleTypeColor = (scheduleType: ScheduleType): string => {
  switch (scheduleType) {
    case "workdays":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "saturday":
      return "bg-amber-100 text-amber-800 border-amber-300"
    case "sunday":
      return "bg-green-100 text-green-800 border-green-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

// Функция для получения градиента заголовка карточки
export const getScheduleTypeGradient = (scheduleType: ScheduleType): string => {
  switch (scheduleType) {
    case "workdays":
      return "from-blue-500 to-blue-600"
    case "saturday":
      return "from-amber-500 to-amber-600"
    case "sunday":
      return "from-green-500 to-green-600"
    default:
      return "from-gray-500 to-gray-600"
  }
}

