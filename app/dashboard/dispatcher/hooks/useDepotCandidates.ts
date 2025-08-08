// hooks/useDepotCandidates.ts
import { useState, useCallback } from "react"
import apiClient from "@/app/api/apiClient" // или как у тебя настроен API клиент

export interface DepotDriver {
  driverId: string
  fullName: string
  serviceNumber: string
  status: string
  routeName: string | null
  busLineNumber: string | null
  convoyNumber: string
}

export interface DepotBus {
  busId: string
  garageNumber: string
  govNumber: string
  status: string
  routeName: string | null
  busLineNumber: string | null
  convoyNumber: string
}

export function useDepotCandidates(depotId: string, date: string) {
  const [drivers, setDrivers] = useState<DepotDriver[]>([])
  const [buses, setBuses] = useState<DepotBus[]>([])
  const [loading, setLoading] = useState(false)

  const loadCandidates = useCallback(async () => {
    if (!depotId || !date) return

    setLoading(true)
    try {
      const [driversRes, busesRes] = await Promise.all([
        apiClient.get(`/api/drivers/by-depot/${depotId}/${date}`),
        apiClient.get(`/api/buses/by-depot/${depotId}/${date}`),
      ])

      if (driversRes?.data?.isSuccess) setDrivers(driversRes.data.value)
      if (busesRes?.data?.isSuccess) setBuses(busesRes.data.value)
    } catch (e) {
      console.warn("Ошибка загрузки кандидатов:", e)
    } finally {
      setLoading(false)
    }
  }, [depotId, date])

  return { drivers, buses, loading, loadCandidates }
}

