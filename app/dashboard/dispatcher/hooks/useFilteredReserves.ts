import { useMemo } from "react"
import type { ReserveDepartureUI } from "@/types/reserve.types"

interface UseFilteredReservesProps {
  departures: ReserveDepartureUI[]
  search?: string
  onlyAssigned?: boolean
}

export function useFilteredReserves({
  departures,
  search = "",
  onlyAssigned = false,
}: UseFilteredReservesProps) {
  const filtered = useMemo(() => {
    return departures.filter((r) => {
      const matchSearch =
        !search ||
        r.driver?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        r.driver?.serviceNumber?.includes(search)

      const matchAssigned = !onlyAssigned || !!r.driver?.serviceNumber

      return matchSearch && matchAssigned
    })
  }, [departures, search, onlyAssigned])

  const totalAssigned = filtered.filter(r => r.driver?.serviceNumber).length

  return {
    filteredReserves: filtered,
    totalAssigned,
  }
}
