"use client"

import React from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StyledDatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
}

export const StyledDatePicker: React.FC<StyledDatePickerProps> = ({
  selected,
  onChange,
  placeholder = "Выберите дату",
}) => {
  return (
    <div className="relative w-full">
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        maxDate={new Date()}
        placeholderText={placeholder}
        className="w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  )
}
