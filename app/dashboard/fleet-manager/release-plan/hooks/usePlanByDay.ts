"use client"

import { useState, useEffect } from "react"
import type { DayPlan, RouteDetails, FinalDispatch } from "../types/plan"
import { getDayPlanMock, getRouteDetailsMock, getFinalDispatchMock } from "../mock/routesMock"

export function usePlanByDay(date: Date) {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Convert date to string to ensure stable dependency
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

  useEffect(() => {
    let isMounted = true

    const fetchDayPlan = async () => {
      setLoading(true)
      try {
        // Imitate API request
        setTimeout(() => {
          if (isMounted) {
            const plan = getDayPlanMock(date)
            setDayPlan(plan)
            setLoading(false)
          }
        }, 500)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Ошибка при загрузке плана"))
          setLoading(false)
        }
      }
    }

    fetchDayPlan()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, [dateKey]) // Use dateKey instead of date object

  return {
    dayPlan,
    loading,
    error,
  }
}

export function useRouteDetails(routeId: string, date: Date) {
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Convert date to string to ensure stable dependency
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

  useEffect(() => {
    let isMounted = true

    const fetchRouteDetails = async () => {
      setLoading(true)
      try {
        // Imitate API request
        setTimeout(() => {
          if (isMounted) {
            const details = getRouteDetailsMock(routeId, date)
            setRouteDetails(details)
            setLoading(false)
          }
        }, 500)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Ошибка при загрузке данных о маршруте"))
          setLoading(false)
        }
      }
    }

    fetchRouteDetails()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [routeId, dateKey]) // Use dateKey instead of date object

  return {
    routeDetails,
    loading,
    error,
  }
}

export function useFinalDispatch(date: Date) {
  const [finalDispatch, setFinalDispatch] = useState<FinalDispatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Convert date to string to ensure stable dependency
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

  useEffect(() => {
    let isMounted = true

    const fetchFinalDispatch = async () => {
      setLoading(true)
      try {
        // Imitate API request
        setTimeout(() => {
          if (isMounted) {
            const routes = getFinalDispatchMock(date)
            const plan = getDayPlanMock(date)

            setFinalDispatch({
              date,
              routeAssignments: routes,
              reserveDrivers: plan.reserveDrivers,
            })

            setLoading(false)
          }
        }, 700)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Ошибка при формировании разнарядки"))
          setLoading(false)
        }
      }
    }

    fetchFinalDispatch()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [dateKey]) // Use dateKey instead of date object

  return {
    finalDispatch,
    loading,
    error,
  }
}

