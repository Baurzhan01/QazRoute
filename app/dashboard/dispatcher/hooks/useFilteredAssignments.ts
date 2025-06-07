import { useMemo } from "react"
import type { RouteGroup } from "@/types/releasePlanTypes"

interface UseFilteredAssignmentsOptions {
  routeGroups: RouteGroup[]
  search?: string
  selectedStatus?: string
  onlyChecked?: boolean
  checkedMap?: Record<string, boolean>
}

export function useFilteredAssignments({
  routeGroups,
  search = "",
  selectedStatus = "",
  onlyChecked = false,
  checkedMap = {},
}: UseFilteredAssignmentsOptions): RouteGroup[] {
  const normalizedSearch = search.trim().toLowerCase()
  const statusFilter = selectedStatus && selectedStatus !== "all" ? parseInt(selectedStatus) : null

  return useMemo(() => {
    return routeGroups
      .map((group) => {
        const filteredAssignments = group.assignments.filter((a) => {
          const matchesSearch =
            !normalizedSearch ||
            a.driver?.fullName?.toLowerCase().includes(normalizedSearch) ||
            a.driver?.serviceNumber?.includes(normalizedSearch)

          const matchesStatus =
            statusFilter === null || a.status === statusFilter

          const matchesChecked =
            !onlyChecked || checkedMap[a.dispatchBusLineId]

          return matchesSearch && matchesStatus && matchesChecked
        })

        return { ...group, assignments: filteredAssignments }
      })
      .filter((group) => group.assignments.length > 0)
  }, [routeGroups, normalizedSearch, statusFilter, onlyChecked, checkedMap])
}
