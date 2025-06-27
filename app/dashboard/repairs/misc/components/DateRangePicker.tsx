"use client"

import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  from: Date
  to: Date
  onFromChange: (date: Date) => void
  onToChange: (date: Date) => void
}

export function DateRangePicker({ from, to, onFromChange, onToChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">С:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-48 text-left", !from && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {from ? format(from, "PPP", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={from} onSelect={(d) => d && onFromChange(d)} locale={ru} />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">По:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-48 text-left", !to && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {to ? format(to, "PPP", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={to} onSelect={(d) => d && onToChange(d)} locale={ru} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
