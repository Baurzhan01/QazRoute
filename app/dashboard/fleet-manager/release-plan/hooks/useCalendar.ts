"use client";

import { useState, useEffect } from "react";
import type { CalendarMonth } from "../types/plan";
import { generateCalendarMonth } from "../utils/generateCalendar";

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState<CalendarMonth | null>(null);
  const [nextMonth, setNextMonth] = useState<CalendarMonth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const current = generateCalendarMonth(year, month);
    const next = generateCalendarMonth(
      month === 11 ? year + 1 : year,
      month === 11 ? 0 : month + 1
    );

    setCurrentMonth(current);
    setNextMonth(next);
    setLoading(false);
  }, []);

  const goToNextMonth = () => {
    if (!currentMonth || !nextMonth) return;
    setLoading(true);

    const year = nextMonth.month === 11 ? nextMonth.year + 1 : nextMonth.year;
    const month = nextMonth.month === 11 ? 0 : nextMonth.month + 1;

    const newCurrent = nextMonth;
    const newNext = generateCalendarMonth(year, month);

    setCurrentMonth(newCurrent);
    setNextMonth(newNext);
    setLoading(false);
  };

  return {
    currentMonth,
    nextMonth,
    loading,
    goToNextMonth,
  };
}
