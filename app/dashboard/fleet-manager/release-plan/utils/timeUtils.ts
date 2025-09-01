// timeUtils.ts
export interface TimeObject {
    hour: number
    minute: number
  }
  export type TimeLike = string | TimeObject | null | undefined
  
  // → "HH:mm:ss" (для сервера). Понимает "H:m", "HH:mm", "HH:mm:ss" и {hour, minute}
  export const toHHmmss = (t: TimeLike): string | null => {
    if (t == null) return null
    if (typeof t === "string") {
      const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
      if (!m) throw new Error(`Bad time "${t}"`)
      const hh = String(+m[1]).padStart(2, "0")
      const mm = String(+m[2]).padStart(2, "0")
      const ss = String(m[3] ? +m[3] : 0).padStart(2, "0")
      return `${hh}:${mm}:${ss}`
    }
    // TimeObject
    const hh = String(t.hour).padStart(2, "0")
    const mm = String(t.minute).padStart(2, "0")
    return `${hh}:${mm}:00`
  }
  
  // → "HH:mm" (для отображения в UI)
  export const toHHmm = (t: TimeLike): string => {
    if (t == null) return ""
    if (typeof t === "string") {
      const [h, m] = t.split(":")
      return `${h.padStart(2,"0")}:${(m ?? "00").padStart(2,"0")}`
    }
    return `${String(t.hour).padStart(2,"0")}:${String(t.minute).padStart(2,"0")}`
  }
  