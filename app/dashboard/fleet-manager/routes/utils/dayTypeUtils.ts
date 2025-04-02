import type { DayType } from "../types"

// Получение названия типа дня на русском
export const getDayTypeName = (dayType: DayType): string => {
  switch (dayType) {
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

// Получение цвета для типа дня
export const getDayTypeColor = (dayType: DayType): string => {
  switch (dayType) {
    case "workdays":
      return "bg-blue-100 text-blue-800"
    case "saturday":
      return "bg-amber-100 text-amber-800"
    case "sunday":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Получение градиента для карточки по типу дня
export const getDayTypeGradient = (dayType: DayType): string => {
  switch (dayType) {
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

// Получение иконки для типа дня
export const getDayTypeIcon = (dayType: DayType): string => {
  switch (dayType) {
    case "workdays":
      return "calendar-days"
    case "saturday":
      return "calendar-check"
    case "sunday":
      return "calendar-heart"
    default:
      return "calendar"
  }
}

