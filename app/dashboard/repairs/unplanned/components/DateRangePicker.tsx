// components/DateRangePicker.tsx
"use client"

import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
}

export function DatePickerWithRange({ value, onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[260px] justify-start text-left font-normal")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd.MM.yyyy")} – {format(value.to, "dd.MM.yyyy")}
              </>
            ) : (
              format(value.from, "dd.MM.yyyy")
            )
          ) : (
            <span>Выберите период</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          initialFocus
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
