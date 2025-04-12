/**
 * Форматирует дату в формате "8 апреля 2025"
 */
export function formatDateLabel(date: Date): string {
    const day = date.getDate()
    const month = date.toLocaleString("ru-RU", { month: "long" })
    const year = date.getFullYear()
  
    return `${day} ${month} ${year}`
  }
  
  /**
   * Форматирует день недели в формате "ПН"
   */
  export function formatDayOfWeek(date: Date): string {
    const daysOfWeek = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"]
    return daysOfWeek[date.getDay()]
  }
  
  /**
   * Определяет тип дня (рабочий, суббота, воскресенье или праздник)
   */
  export function getDayType(date: Date, holidays: Date[]): "workday" | "saturday" | "sunday" | "holiday" {
    // Проверяем, является ли день праздником
    if (isHoliday(date, holidays)) {
      return "holiday"
    }
  
    const day = date.getDay()
    if (day === 0) return "sunday"
    if (day === 6) return "saturday"
    return "workday"
  }
  
  /**
   * Проверяет, является ли день праздником
   */
  export function isHoliday(date: Date, holidays: Date[]): boolean {
    return holidays.some(
      (holiday) =>
        holiday.getDate() === date.getDate() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getFullYear() === date.getFullYear(),
    )
  }
  
  /**
   * Получает название месяца на русском языке
   */
  export function getMonthName(date: Date): string {
    return date.toLocaleString("ru-RU", { month: "long" })
  }
  
  /**
   * Создает объект Date из строки в формате YYYY-MM-DD
   */
  export function parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }
  
  /**
   * Форматирует дату в формате YYYY-MM-DD
   */
  export function formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  
  /**
   * Проверяет, является ли дата текущей датой
   */
  export function isToday(date: Date): boolean {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }
  
  /**
   * Получает название праздника по дате (заглушка)
   */
  export function getHolidayName(date: Date, holidays: Record<string, string>): string | undefined {
    const dateKey = formatDate(date)
    return holidays[dateKey]
  }
  