// utils/driverUtils.ts

export function formatShortName(fullName?: string): string {
    if (!fullName) return "—"
    const [last, first = "", middle = ""] = fullName.trim().split(" ")
    const initials = `${first.charAt(0)}.${middle.charAt(0)}.`.toUpperCase()
    return `${last} ${initials}`
  }
  