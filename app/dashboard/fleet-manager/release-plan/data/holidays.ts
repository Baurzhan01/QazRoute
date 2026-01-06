// release-plan/data/holidays.ts

export interface Holiday {
  date: string // format: "YYYY-MM-DD"
  name: string
}

interface HolidayRule {
  month: number
  day: number
  name: string
}

// Список официальных праздников РК (дополняется при необходимости)
const fixedHolidays: HolidayRule[] = [
  { month: 1, day: 1, name: "Новый год" },
  { month: 1, day: 2, name: "Новый год" },
  { month: 1, day: 7, name: "Рождество" },
  { month: 3, day: 8, name: "Международный женский день" },
  { month: 3, day: 21, name: "Наурыз мейрамы" },
  { month: 5, day: 1, name: "Праздник единства народа" },
  { month: 5, day: 7, name: "День защитников Отечества" },
  { month: 5, day: 9, name: "День Победы" },
  { month: 7, day: 6, name: "День Столицы" },
  { month: 9, day: 1, name: "1 сентября" },
  { month: 10, day: 27, name: "День Республики" },
  { month: 12, day: 16, name: "День Независимости" },
]

const holidaysByYear: Record<number, HolidayRule[]> = {
  2026: [
    { month: 6, day: 6, name: "Курбан айт" },
    { month: 7, day: 7, name: "День Столицы" },
  ],
}

function formatDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0")
  const dd = String(day).padStart(2, "0")
  return `${year}-${mm}-${dd}`
}

function validateHolidays(year: number, holidays: Holiday[]): void {
  const errors: string[] = []
  const seen = new Set<string>()

  for (const holiday of holidays) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(holiday.date)) {
      errors.push(`${holiday.name}: некорректный формат даты "${holiday.date}"`)
      continue
    }

    const [yearStr, monthStr, dayStr] = holiday.date.split("-")
    const parsedYear = Number(yearStr)
    const parsedMonth = Number(monthStr)
    const parsedDay = Number(dayStr)
    const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay))

    if (
      parsedYear !== date.getUTCFullYear() ||
      parsedMonth !== date.getUTCMonth() + 1 ||
      parsedDay !== date.getUTCDate()
    ) {
      errors.push(`${holiday.name}: некорректная дата "${holiday.date}"`)
    }

    if (seen.has(holiday.date)) {
      errors.push(`${holiday.name}: повторяющаяся дата "${holiday.date}"`)
    } else {
      seen.add(holiday.date)
    }
  }

  if (errors.length > 0) {
    console.warn(`[holidays] Проверка дат за ${year}:\n${errors.join("\n")}`)
  }
}

const validatedYears = new Set<number>()

export function getHolidaysForYear(year: number): Holiday[] {
  const rules = [...fixedHolidays, ...(holidaysByYear[year] ?? [])]
  const list = rules.map((rule) => ({
    date: formatDate(year, rule.month, rule.day),
    name: rule.name,
  }))

  if (process.env.NODE_ENV !== "production" && !validatedYears.has(year)) {
    validateHolidays(year, list)
    validatedYears.add(year)
  }

  const deduped = new Map<string, Holiday>()
  for (const holiday of list) {
    deduped.set(holiday.date, holiday)
  }

  return Array.from(deduped.values()).sort((a, b) => a.date.localeCompare(b.date))
}
