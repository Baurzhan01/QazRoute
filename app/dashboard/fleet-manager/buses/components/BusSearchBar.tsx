"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface BusSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function BusSearchBar({ searchQuery, onSearchChange }: BusSearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder="Поиск по гаражному номеру или госномеру..."
        className="pl-10 w-full md:w-96"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}

