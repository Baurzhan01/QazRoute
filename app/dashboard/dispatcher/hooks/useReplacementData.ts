"use client"

import { useState, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

import { driverService } from "@/service/driverService"
import { busService } from "@/service/busService"
import { repairService } from "@/service/repairService"
import { releasePlanService } from "@/service/releasePlanService"

import type { DisplayBus, BusStatus } from "@/types/bus.types"
import type { DisplayDriver, DriverStatus } from "@/types/driver.types"
import type {
  ReserveReplacementCandidate,
  AssignmentReplacement,
} from "@/types/releasePlanTypes"
import type { RepairDto } from "@/types/repair.types"

export type CandidateSource =
  | "reserve"
  | "order"
  | "repair"
  | "assignment"
  | "freeBus"
  | "freeDriver"

export interface CandidateRow {
  id: string
  source: CandidateSource
  driver?: DisplayDriver
  bus?: DisplayBus
  routeNumber?: string
  exitNumber?: string
  dispatchBusLineId?: string
}

export interface BusRow {
  id: string
  source: CandidateSource
  garageNumber?: string
  govNumber?: string
  status?: BusStatus
}

export function useReplacementData(date: string, convoyId: string) {
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [buses, setBuses] = useState<BusRow[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!date || !convoyId) return
    setLoading(true)

    try {
      const [
        reserveRes,
        orderRes,
        repairRes,
        assignmentRes,
        freeBusesRes,
        freeDriversRes,
      ] = await Promise.all([
        releasePlanService.getReserveReplacementsByDate(date, convoyId),
        releasePlanService.getReserveAssignmentsByDate(date, convoyId, "Order"),
        repairService.getRepairsByDate(date, convoyId),
        releasePlanService.getExtendedAssignmentsByDepot(
          date,
          localStorage.getItem("busDepotId") || ""
        ),
        busService.getWeekendBuses(date, convoyId),
        driverService.getWeekendDrivers(date, convoyId),
      ])

      const mappedCandidates: CandidateRow[] = []
      const mappedBuses: BusRow[] = []

      // Резерв
      mappedCandidates.push(
        ...(reserveRes.value || []).map((r: ReserveReplacementCandidate) => ({
          id: r.id || "",
          dispatchBusLineId: r.dispatchBusLineId || "",
          source: "reserve" as CandidateSource,
          driver: {
            id: r.driverId || "",
            fullName: r.driverFullName,
            serviceNumber: r.driverTabNumber,
            driverStatus: "OnWork" as DriverStatus,
          },
          bus: {
            id: r.busId || "",
            garageNumber: r.garageNumber,
            govNumber: r.govNumber,
            status: "Reserve" as BusStatus,
          },
        }))
      )
      mappedBuses.push(
        ...(reserveRes.value || []).map((r: ReserveReplacementCandidate) => ({
          id: r.busId || "",
          source: "reserve" as CandidateSource,
          garageNumber: r.garageNumber,
          govNumber: r.govNumber,
          status: "Reserve" as BusStatus,
        }))
      )

      // Заказы
      mappedCandidates.push(
        ...(orderRes.value || []).map((o: any) => ({
          id: o.id || "",
          dispatchBusLineId: o.dispatchBusLineId || "",
          source: "order" as CandidateSource,
          driver: {
            id: o.driverId || "",
            fullName: o.driverFullName,
            serviceNumber: o.driverTabNumber,
            driverStatus: "OnWork" as DriverStatus,
          },
          bus: {
            id: o.busId || "",
            garageNumber: o.garageNumber,
            govNumber: o.govNumber,
            status: "Reserve" as BusStatus,
          },
        }))
      )
      mappedBuses.push(
        ...(orderRes.value || []).map((o: any) => ({
          id: o.busId || "",
          source: "order" as CandidateSource,
          garageNumber: o.garageNumber,
          govNumber: o.govNumber,
          status: "Reserve" as BusStatus,
        }))
      )

      // Плановый ремонт
      mappedCandidates.push(
        ...(repairRes.value || []).map((r: RepairDto) => ({
          id: r.id || "",
          source: "repair" as CandidateSource,
          driver: r.driver
            ? {
                id: r.driver.id || "",
                fullName: r.driver.fullName,
                serviceNumber: r.driver.serviceNumber,
                driverStatus: "OnWork" as DriverStatus,
              }
            : undefined,
          bus: r.bus
            ? {
                id: r.bus.id || "",
                garageNumber: r.bus.garageNumber,
                govNumber: r.bus.govNumber,
                status: "Reserve" as BusStatus,
              }
            : undefined,
        }))
      )

      // Перестановка с маршрутов
      mappedCandidates.push(
        ...(assignmentRes.value || []).map((a: AssignmentReplacement) => ({
          id: a.dispatchBusLineId || "",
          dispatchBusLineId: a.dispatchBusLineId || "",
          source: "assignment" as CandidateSource,
          driver: a.firstDriver
            ? {
                id: a.firstDriver.id || "",
                fullName: a.firstDriver.fullName,
                serviceNumber: (a.firstDriver as any).serviceNumber || "—",
                driverStatus: "OnWork" as DriverStatus,
              }
            : undefined,
          bus: a.bus
            ? {
                id: a.bus.id || "",
                garageNumber: a.bus.garageNumber,
                govNumber: a.bus.govNumber,
                status: "OnWork" as BusStatus,
              }
            : undefined,
          routeNumber: a.routeNumber,
          exitNumber: a.exitNumber,
        }))
      )
      mappedBuses.push(
        ...(assignmentRes.value || [])
          .filter((a) => a.bus)
          .map((a) => ({
            id: a.bus?.id || "",
            source: "assignment" as CandidateSource,
            garageNumber: a.bus!.garageNumber,
            govNumber: a.bus!.govNumber,
            status: "OnWork" as BusStatus,
          }))
      )

      // Свободные автобусы
      mappedBuses.push(
        ...(freeBusesRes.value || []).map((b: DisplayBus) => ({
          id: b.id || "",
          source: "freeBus" as CandidateSource,
          garageNumber: b.garageNumber,
          govNumber: b.govNumber,
          status: b.status as BusStatus,
        }))
      )

      // Свободные водители
      mappedCandidates.push(
        ...(freeDriversRes.value || []).map((d: DisplayDriver) => ({
          id: d.id || "",
          source: "freeDriver" as CandidateSource,
          driver: {
            ...d,
            driverStatus: d.driverStatus as DriverStatus,
          },
        }))
      )

      setCandidates(mappedCandidates)
      setBuses(mappedBuses)
    } catch {
      toast({ title: "Ошибка загрузки данных", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [date, convoyId])

  return { candidates, buses, loading, loadData }
}
