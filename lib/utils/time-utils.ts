// lib/utils/time-utils.ts

/**
 * Удаляет секунды из времени (HH:mm:ss → HH:mm)
 */
export function formatTime(time?: string | null): string {
    if (!time) return "-"
    return time.slice(0, 5)
  }
  