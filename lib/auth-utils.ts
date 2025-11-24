export function getAuthData() {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("authData")
  if (!stored) return null

  try {
    return JSON.parse(stored) as {
      id?: string
      userId?: string
      fullName?: string
      convoyId?: string
      busDepotId?: string
      role?: string
      convoyNumber?: string
    }
  } catch (e) {
    console.error("Ошибка разбора authData из localStorage:", e)
    return null
  }
}
