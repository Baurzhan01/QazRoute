"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { LocalDeparture } from "@/types/releasePlanTypes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Save, BusIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouteAssignments } from "../../../../../hooks/useRouteAssignments";
import { releasePlanService } from "@/service/releasePlanService";
import DepartureTable from "./components/DepartureTable";
import AssignmentDialog from "./components/AssignmentDialog";
import TimeEditModal from "./components/TimeEditModal";
import SecondShiftModal from "./components/SecondShiftModal";
import EditAssignmentModal from "./components/EditAssignmentModal";
import { useFilteredBuses } from "../../../../../hooks/useFilteredBuses";
import { useFilteredDrivers } from "../../../../../hooks/useFilteredDrivers";
import type { DisplayBus } from "@/types/bus.types";
import type { DisplayDriver } from "@/types/driver.types";
import { getAuthData } from "@/lib/auth-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function RouteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.routeId as string;
  const dateString = params.date as string;
  const dayType = params.dayType as string;

  const [date] = useState<Date>(() => new Date(dateString));

  const auth = getAuthData();
  const { data, isLoading, refetch } = useRouteAssignments(routeId, date);

  const [assignedBusesInRoute, setAssignedBusesInRoute] = useState<Record<string, { routeNumber: string; departureNumber: number }>>({});
  const [assignedDriversInRoute, setAssignedDriversInRoute] = useState<Record<string, { routeNumber: string; departureNumber: number }>>({});
  const [departures, setDepartures] = useState<LocalDeparture[]>([]);
  const [selectedDeparture, setSelectedDeparture] = useState<LocalDeparture | null>(null);
  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null);
  const [busSearchQuery, setBusSearchQuery] = useState("");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [timeEditType, setTimeEditType] = useState<"departureTime" | "scheduleTime" | "endTime">("departureTime");
  const [currentTimeValue, setCurrentTimeValue] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTimeEditModalOpen, setIsTimeEditModalOpen] = useState(false);
  const [isSecondShiftModalOpen, setIsSecondShiftModalOpen] = useState(false);
  const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const selectedBusIds = selectedBus ? [selectedBus.id] : [];
  const assignedBusIds = Object.keys(assignedBusesInRoute);
  const assignedDriverIds = Object.keys(assignedDriversInRoute);

  const filteredBuses = useFilteredBuses(data?.buses ?? [], busSearchQuery, assignedBusIds);
  const filteredDrivers = useFilteredDrivers(data?.drivers ?? [], assignedDriverIds, selectedBusIds, driverSearchQuery);

  useEffect(() => {
    if (data?.departures) {
      const updated: LocalDeparture[] = data.departures.map((d) => ({
        ...d,
        shift2AdditionalInfo: d.shift2AdditionalInfo ?? "",
        shift2Time: d.shift2Time ?? "",
        isModified: false,
      }));

      const busesInRoute = updated.reduce((acc, d) => {
        if (d.bus?.id) acc[d.bus.id] = { routeNumber: data?.routeNumber || "", departureNumber: d.departureNumber };
        return acc;
      }, {} as Record<string, { routeNumber: string; departureNumber: number }>);

      const driversInRoute = updated.reduce((acc, d) => {
        if (d.driver?.id) acc[d.driver.id] = { routeNumber: data?.routeNumber || "", departureNumber: d.departureNumber };
        return acc;
      }, {} as Record<string, { routeNumber: string; departureNumber: number }>);

      setAssignedBusesInRoute(busesInRoute);
      setAssignedDriversInRoute(driversInRoute);
      setDepartures(updated);
    }
  }, [data?.departures]);

  useEffect(() => {
    const createIfMissing = async () => {
      if (!data?.departures?.length && auth?.convoyId && routeId && dateString) {
        try {
          await releasePlanService.createDispatchRoute(auth.convoyId, routeId, dateString);
          await refetch();
        } catch (error: any) {
          if (error?.message?.includes("Разнарядка уже есть")) {
            await refetch();
          } else {
            toast({ title: "Ошибка создания разнарядки", variant: "destructive" });
          }
        }
      }
    };

    createIfMissing();
  }, [data?.departures, auth?.convoyId, routeId, dateString, refetch]);

  const handleSaveAllAssignments = async () => {
    if (!data?.dispatchRouteId) {
      toast({ title: "Не найден ID разнарядки", variant: "destructive" });
      return;
    }
  
    try {
      for (const dep of departures) {
        const dispatchBusLineId = dep.id;
        const busId = dep.bus?.id ?? null;
        const driver1Id = dep.driver?.id ?? null;
        const driver2Id = dep.shift2Driver?.id ?? null;
  
        const payload = {
          dispatchBusLineId,
          busId,
          driver1Id,
          driver2Id,
        };
  
        if (busId || driver1Id || driver2Id) {
          // Есть назначение → POST назначение
          await releasePlanService.assignToBusLine(dateString, payload);
        } else {
          // Нет назначений → PUT снять назначение
          await releasePlanService.updateBusLineAssignment(dateString, payload);
        }
      }
  
      toast({ title: "Изменения успешно сохранены" });
      router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}`);
    } catch (error) {
      toast({ title: "Ошибка сохранения изменений", variant: "destructive" });
    }
  };  

  const handleBack = () => {
    if (departures.some(d => d.isModified)) {
      setPendingNavigation(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}`);
      setIsConfirmDialogOpen(true);
    } else {
      router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}`);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Маршрут № {data?.routeNumber}</h1>
          <p className="text-sm text-muted-foreground">{date.toLocaleDateString()}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse bg-gray-200 rounded" />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="flex items-center gap-2"><BusIcon className="w-5 h-5" /> План выходов</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DepartureTable
                departures={departures}
                onAddBus={dep => { setSelectedDeparture(dep); setIsAddDialogOpen(true); }}
                onEditTime={(dep, type) => { setSelectedDeparture(dep); setTimeEditType(type); setCurrentTimeValue(dep[type]); setIsTimeEditModalOpen(true); }}
                onEditAssignment={dep => { setSelectedDeparture(dep); setIsEditAssignmentModalOpen(true); }}
                onAddSecondShift={dep => { setSelectedDeparture(dep); setIsSecondShiftModalOpen(true); }}
                onRemoveAssignment={depId => {
                  setDepartures(prev => prev.map(d => d.id === depId ? { ...d, bus: undefined, driver: undefined, isModified: true } : d));
                  toast({ title: "Назначение снято" });
                }}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveAllAssignments} className="gap-2"><Save className="w-4 h-4" /> Сохранить</Button>
          </div>

          <AssignmentDialog
            open={isAddDialogOpen}
            onClose={() => { setIsAddDialogOpen(false); setSelectedDeparture(null); }}
            selectedDeparture={selectedDeparture}
            selectedBus={selectedBus}
            selectedDriver={selectedDriver}
            filteredBuses={filteredBuses}
            filteredDrivers={filteredDrivers}
            busSearchQuery={busSearchQuery}
            driverSearchQuery={driverSearchQuery}
            onBusSearchChange={setBusSearchQuery}
            onDriverSearchChange={setDriverSearchQuery}
            onSelectBus={setSelectedBus}
            onSelectDriver={setSelectedDriver}
            assignedBusesMap={assignedBusesInRoute}
            assignedDriversMap={assignedDriversInRoute}
            date={dateString}
            routeId={routeId}

            // ✅ Вот этого не хватает:
            convoyId={auth?.convoyId || ""}

            onSaved={(bus, driver) => {
              if (bus) setAssignedBusesInRoute(prev => ({ ...prev, [bus.id]: { routeNumber: data?.routeNumber || "", departureNumber: selectedDeparture?.departureNumber ?? 0 } }));
              if (driver) setAssignedDriversInRoute(prev => ({ ...prev, [driver.id]: { routeNumber: data?.routeNumber || "", departureNumber: selectedDeparture?.departureNumber ?? 0 } }));
            }}
          />

          <TimeEditModal
            isOpen={isTimeEditModalOpen}
            onClose={() => setIsTimeEditModalOpen(false)}
            onSave={time => {
              if (!selectedDeparture) return;
              setDepartures(prev => prev.map(dep => dep.id === selectedDeparture.id ? { ...dep, [timeEditType]: time, isModified: true } : dep));
              setIsTimeEditModalOpen(false);
            }}
            currentTime={currentTimeValue}
            title="Изменить время"
          />

          <SecondShiftModal
            isOpen={isSecondShiftModalOpen}
            onClose={() => { setIsSecondShiftModalOpen(false); setSelectedDeparture(null); }}
            departure={selectedDeparture}
            availableDrivers={filteredDrivers}
            schedules={data?.schedules || []}
            onSave={(driverId, shiftTime) => {
              const driver = filteredDrivers.find(d => d.id === driverId);
              if (!selectedDeparture || !driver) return;
              setDepartures(prev => prev.map(dep => dep.id === selectedDeparture.id ? { ...dep, shift2Driver: driver, shift2Time: shiftTime, isModified: true } : dep));
              setIsSecondShiftModalOpen(false);
            }}
          />

          <EditAssignmentModal
            isOpen={isEditAssignmentModalOpen}
            onClose={() => { setIsEditAssignmentModalOpen(false); setSelectedDeparture(null); }}
            departure={selectedDeparture}
            availableBuses={filteredBuses}
            availableDrivers={filteredDrivers}
            onSave={updated => {
              setDepartures(prev => prev.map(dep => dep.id === updated.id ? updated as LocalDeparture : dep));
              setIsEditAssignmentModalOpen(false);
            }}
          />
        </motion.div>
      )}

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Есть несохранённые изменения</DialogTitle>
          </DialogHeader>
          <p>Вы уверены, что хотите выйти? Все несохранённые изменения будут потеряны.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Остаться</Button>
            <Button onClick={() => {
              if (pendingNavigation) router.push(pendingNavigation);
            }}>Выйти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
