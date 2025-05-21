"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { DispatcherFilters } from "../types/dispatcher.types"

interface DispatcherFiltersComponentProps {
  filters: DispatcherFilters
  convoys: { id: string; name: string; number: string }[]
  onFilterChange: (filters: DispatcherFilters) => void
}

export function DispatcherFiltersComponent({ filters, convoys, onFilterChange }: DispatcherFiltersComponentProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value === "all" ? null : (value as any) })
  }

  const handleConvoyChange = (value: string) => {
    onFilterChange({ ...filters, convoyId: value === "all" ? null : value })
  }

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="status-filter" className="mb-2 block text-sm font-medium text-gray-700">
          Фильтр по статусу
        </Label>
        <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Выберите статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="online">Онлайн</SelectItem>
            <SelectItem value="offline">Оффлайн</SelectItem>
            <SelectItem value="blocked">Заблокирован</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="convoy-filter" className="mb-2 block text-sm font-medium text-gray-700">
          Фильтр по автоколонне
        </Label>
        <Select value={filters.convoyId || "all"} onValueChange={handleConvoyChange}>
          <SelectTrigger id="convoy-filter">
            <SelectValue placeholder="Выберите автоколонну" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все автоколонны</SelectItem>
            {convoys.map((convoy) => (
              <SelectItem key={convoy.id} value={convoy.id}>
                {convoy.name} ({convoy.number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
