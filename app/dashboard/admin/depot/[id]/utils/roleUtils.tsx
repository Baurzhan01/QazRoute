import { Briefcase, Clock, FileText, Users, Wrench, UserCog } from "lucide-react"

// Функция для получения иконки роли
export const getRoleIcon = (role: string) => {
  switch (role) {
    case "fleet-manager":
      return <Briefcase className="h-10 w-10 text-sky-500" />
    case "senior-dispatcher":
      return <Clock className="h-10 w-10 text-amber-500" />
    case "dispatcher":
      return <Clock className="h-10 w-10 text-green-500" />
    case "mechanic":
      return <Wrench className="h-10 w-10 text-purple-500" />
    case "hr":
      return <Users className="h-10 w-10 text-rose-500" />
    case "taksirovka":
      return <FileText className="h-10 w-10 text-blue-500" />
    default:
      return <UserCog className="h-10 w-10 text-gray-500" />
  }
}

// Функция для получения названия роли
export const getRoleName = (role: string) => {
  switch (role) {
    case "fleet-manager":
      return "Начальник колонны"
    case "senior-dispatcher":
      return "Старший диспетчер"
    case "dispatcher":
      return "Диспетчер"
    case "mechanic":
      return "Механик"
    case "hr":
      return "Отдел кадров"
    case "taksirovka":
      return "Отдел таксировки"
    default:
      return "Неизвестная роль"
  }
}

// Функция для получения заголовка карточки роли
export const getRoleCardTitle = (role: string) => {
  switch (role) {
    case "fleet-manager":
      return "Начальники колонн"
    case "senior-dispatcher":
      return "Старшие диспетчеры"
    case "dispatcher":
      return "Диспетчеры"
    case "mechanic":
      return "Механики"
    case "hr":
      return "Отдел кадров"
    case "taksirovka":
      return "Отдел таксировки"
    default:
      return "Пользователи"
  }
}

// Функция для получения цвета фона карточки роли
export const getRoleCardGradient = (role: string) => {
  switch (role) {
    case "fleet-manager":
      return "from-sky-500 to-sky-600"
    case "senior-dispatcher":
      return "from-amber-500 to-amber-600"
    case "dispatcher":
      return "from-green-500 to-green-600"
    case "mechanic":
      return "from-purple-500 to-purple-600"
    case "hr":
      return "from-rose-500 to-rose-600"
    case "taksirovka":
      return "from-blue-500 to-blue-600"
    default:
      return "from-gray-500 to-gray-600"
  }
}

// Функция для получения ключа объекта usersByRole по роли
export const getRoleKey = (role: string) => {
  switch (role) {
    case "fleet-manager":
      return "fleetManager"
    case "senior-dispatcher":
      return "seniorDispatcher"
    case "dispatcher":
      return "dispatcher"
    case "mechanic":
      return "mechanic"
    case "hr":
      return "hr"
    case "taksirovka":
      return "taksirovka"
    default:
      return ""
  }
}

