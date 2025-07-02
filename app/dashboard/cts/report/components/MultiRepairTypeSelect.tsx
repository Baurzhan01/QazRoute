"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import type { RouteExitRepairStatus } from "@/types/routeExitRepair.types"
import { repairTypeLabels } from "@/app/constants/repairTypeLabels" // 🆕 вынеси, если нужно использовать везде

interface Props {
  value: RouteExitRepairStatus[]
  onChange: (v: RouteExitRepairStatus[]) => void
}

export function MultiRepairTypeSelect({ value, onChange }: Props) {
  const allTypes: RouteExitRepairStatus[] = ["Unscheduled", "Other", "LongTerm"]

  const toggle = (type: RouteExitRepairStatus) => {
    if (value.includes(type)) {
      onChange(value.filter((t) => t !== type))
    } else {
      onChange([...value, type])
    }
  }

  const label = value.length === allTypes.length
    ? "Все типы ремонта"
    : value.map((v) => repairTypeLabels[v]).join(", ")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[220px] justify-start">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="flex flex-col gap-2">
          {allTypes.map((type) => (
            <label
              key={type}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Checkbox
                checked={value.includes(type)}
                onCheckedChange={() => toggle(type)}
              />
              <span>{repairTypeLabels[type]}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
