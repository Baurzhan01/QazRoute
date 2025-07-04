"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { busService } from "@/service/busService"
import type { Bus } from "@/types/bus.types"
import { cn } from "@/lib/utils"
import { getAuthData } from "@/lib/auth-utils"

interface Props {
  onSelect: (bus: Bus) => void
}

export default function BusAutocompleteConvoyOnly({ onSelect }: Props) {
  const [query, setQuery] = useState("")
  const [buses, setBuses] = useState<Bus[]>([])
  const [filtered, setFiltered] = useState<Bus[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const auth = getAuthData()
    if (!auth?.convoyId) return

    busService
      .filter({ convoyId: auth.convoyId, page: 1, pageSize: 100 })
      .then((res) => setBuses(res.items ?? []))
  }, [])

  useEffect(() => {
    const lower = query.toLowerCase()
    setFiltered(
      buses.filter(
        (b) =>
          b.govNumber?.toLowerCase().includes(lower) ||
          b.vinCode?.toLowerCase().includes(lower) ||
          b.garageNumber?.toLowerCase().includes(lower)
      )
    )
  }, [query, buses])

  return (
    <div className="relative">
      <Input
        placeholder="Поиск по VIN, гос. или гаражному номеру"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowDropdown(true)
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white shadow-md border mt-1 max-h-64 overflow-y-auto rounded-md text-sm">
          {filtered.map((bus) => (
            <li
              key={bus.id}
              onClick={() => {
                onSelect(bus)
                setQuery(`${bus.govNumber} (${bus.garageNumber})`)
                setShowDropdown(false)
              }}
              className={cn("px-4 py-2 cursor-pointer hover:bg-sky-100 border-b last:border-b-0")}
            >
              <div className="font-medium">{bus.govNumber}</div>
              <div className="text-muted-foreground text-xs">
                VIN: {bus.vinCode} | Гараж: {bus.garageNumber}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
