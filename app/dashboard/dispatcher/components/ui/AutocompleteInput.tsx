// components/ui/AutocompleteInput.tsx
"use client"

import { useMemo, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AutocompleteInputProps<T> {
  items: T[]
  selectedId: string
  onSelect: (id: string) => void
  placeholder?: string
  displayValue: (item: T) => string
  idKey: keyof T
  disabled?: boolean
  label?: string
}

export default function AutocompleteInput<T>({
  items,
  selectedId,
  onSelect,
  placeholder = "Поиск...",
  displayValue,
  idKey,
  disabled = false,
  label,
}: AutocompleteInputProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => displayValue(item).toLowerCase().includes(search.toLowerCase()))
      .slice(0, 10)
  }, [search, items, displayValue])

  const selected = items.find((i) => i[idKey] === selectedId)

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selected ? displayValue(selected) : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Поиск..." value={search} onValueChange={setSearch} />
            <CommandEmpty>Не найдено</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={String(item[idKey])}
                  onSelect={() => {
                    onSelect(String(item[idKey]))
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === item[idKey] ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {displayValue(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
