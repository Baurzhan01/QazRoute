// ✅ Финальная версия RouteDetailsPage.tsx с правильно размещёнными хуками

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Save, BusIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { useRouteAssignments } from "../../../../../hooks/useRouteAssignments";
import { releasePlanService } from "@/service/releasePlanService";
import { getAuthData } from "@/lib/auth-utils";

import DepartureTable from "./components/DepartureTable";
import AssignmentDialog from "./components/AssignmentDialog";
import TimeEditModal from "./components/TimeEditModal";
import SecondShiftModal from "./components/SecondShiftModal";
import EditAssignmentModal from "./components/EditAssignmentModal";

import type { LocalDeparture } from "@/types/releasePlanTypes";
import type { DisplayBus } from "@/types/bus.types";
import type { DisplayDriver } from "@/types/driver.types";
import { useSearchParams } from "next/navigation";

export default function RouteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.routeId as string;
  const dateString = params.date as string;
  const dayType = params.dayType as string;

  const date = new Date(dateString);
  const auth = getAuthData();

  const { data, isLoading, refetch } = useRouteAssignments(routeId, date);

  const [busSearchQuery, setBusSearchQuery] = useState("");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null);
  const [assignedBusesInRoute, setAssignedBusesInRoute] = useState<Record<string, { routeNumber: string; departureNumber: number }>>({});
  const [assignedDriversInRoute, setAssignedDriversInRoute] = useState<Record<string, { routeNumber: string; departureNumber: number }>>({});

  const [departures, setDepartures] = useState<LocalDeparture[]>([]);
  
  const [selectedDeparture, setSelectedDeparture] = useState<LocalDeparture | null>(null);
  const [timeEditType, setTimeEditType] = useState<"exitTime" | "endTime" | "shiftChangeTime" | null>(null);
  const [currentTimeValue, setCurrentTimeValue] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTimeEditModalOpen, setIsTimeEditModalOpen] = useState(false);
  const [isSecondShiftModalOpen, setIsSecondShiftModalOpen] = useState(false);
  const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const fromFinalDispatch = searchParams.get("from") === "final-dispatch";
  

  useEffect(() => {
    if (data?.departures) {
      const sorted = [...data.departures]
        .sort((a, b) => {
          const aNumber = parseInt(a.busLine?.number ?? "0", 10);
          const bNumber = parseInt(b.busLine?.number ?? "0", 10);
          return aNumber - bNumber;
        })
        .map((d) => ({
          ...d,
          shift2AdditionalInfo: d.shift2AdditionalInfo ?? "",
          shift2Time: d.shift2Time ?? "",
          isModified: false,
        }));
  
      setDepartures(sorted);
    }
  }, [data?.departures]);  

  // useEffect(() => {
  //   const createIfMissing = async () => {
  //     if (!data?.departures?.length && auth?.convoyId && routeId && dateString) {
  //       try {
  //         await releasePlanService.createDispatchRoute(auth.convoyId, routeId, dateString);
  //         await refetch();
  //       } catch (error: any) {
  //         if (error?.message?.includes("Разнарядка уже есть")) {
  //           await refetch();
  //         } else {
  //           toast({ title: "Ошибка создания разнарядки", variant: "destructive" });
  //         }
  //       }
  //     }
  //   };
  //   createIfMissing();
  // }, [data?.departures, auth?.convoyId, routeId, dateString, refetch]);

  const handleSaveAllAssignments = async () => {
    if (!data?.dispatchRouteId) {
      toast({ title: "Не найден ID разнарядки", variant: "destructive" });
      return;
    }
  
    try {
      for (const dep of departures) {
        if (!dep.isModified) continue;
  
        const payload = {
          dispatchBusLineId: dep.id,
          busId: dep.bus?.id ?? null,
          driver1Id: dep.driver?.id ?? null,
          driver2Id: dep.shift2Driver?.id ?? null,
        };
  
        await releasePlanService.updateBusLineAssignment(dateString, payload);
      }
  
      await refetch(); // 🔄 получить актуальные данные
  
      toast({ title: "Изменения успешно сохранены" });
      router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}`);
    } catch (error: any) {
      toast({
        title: "Ошибка сохранения изменений",
        description: error?.response?.data?.error ?? "",
        variant: "destructive",
      });
    }
  };
  
  const handleEditTime = (dep: LocalDeparture, type: "exitTime" | "endTime" | "shiftChangeTime") => {
    setSelectedDeparture(dep);
    setTimeEditType(type);
    setIsTimeEditModalOpen(true);
  };
  

  const handleBack = () => {
    const base = `/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}`;
    const returnUrl = fromFinalDispatch ? `${base}/final-dispatch` : base;
  
    if (departures.some((d) => d.isModified)) {
      setPendingNavigation(returnUrl);
      setIsConfirmDialogOpen(true);
    } else {
      router.push(returnUrl);
    }
  };
  

  const handleRemoveAssignment = async (depId: string) => {
    const dep = departures.find((d) => d.id === depId);
    if (!dep) return;

    await releasePlanService.updateBusLineAssignment(dateString, {
      dispatchBusLineId: dep.id,
      busId: null,
      driver1Id: null,
      driver2Id: null,
    });

    setDepartures((prev) =>
      prev.map((d) => d.id === depId ? { ...d, bus: undefined, driver: undefined, shift2Driver: undefined, isModified: true } : d)
    );

    toast({ title: "Назначение снято" });
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
              <CardTitle className="flex items-center gap-2">
                <BusIcon className="w-5 h-5" /> План выходов
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
            <DepartureTable
              departures={departures}
              date={dateString} // 🔧 добавлено
              onAddBus={(dep) => { setSelectedDeparture(dep); setIsAddDialogOpen(true); }}
              onEditTime={handleEditTime}
              onEditAssignment={(dep) => { setSelectedDeparture(dep); setIsEditAssignmentModalOpen(true); }}
              onAddSecondShift={(dep) => { setSelectedDeparture(dep); setIsSecondShiftModalOpen(true); }}
              onRemoveAssignment={(depId) => handleRemoveAssignment(depId)} // 🔧 существующее
              onRemoveLocally={(depId) => {
                setDepartures(prev => prev.map(d => d.id === depId ? { ...d, bus: undefined, driver: undefined, isModified: true } : d));
              }} // 🔧 добавлено
            />
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveAllAssignments} className="gap-2">
              <Save className="w-4 h-4" /> Сохранить
            </Button>
          </div>

          {data && selectedDeparture && (
            <AssignmentDialog
              open={isAddDialogOpen}
              onClose={() => {
                setIsAddDialogOpen(false);
                setSelectedDeparture(null);
              }}
              selectedDeparture={selectedDeparture}
              assignedBusesMap={assignedBusesInRoute}
              assignedDriversMap={assignedDriversInRoute}
              globalAssignedDriversMap={data.globalAssignedDriversMap}
              date={dateString}
              routeId={routeId}
              convoyId={auth?.convoyId || ""}
              onSaved={(bus, driver) => {
                if (bus) {
                  setAssignedBusesInRoute((prev) => ({
                    ...prev,
                    [bus.id]: {
                      routeNumber: data?.routeNumber || "",
                      departureNumber: selectedDeparture?.departureNumber ?? 0,
                    },
                  }));
                }
                if (driver) {
                  setAssignedDriversInRoute((prev) => ({
                    ...prev,
                    [driver.id]: {
                      routeNumber: data?.routeNumber || "",
                      departureNumber: selectedDeparture?.departureNumber ?? 0,
                    },
                  }));
                }
            
                // 💡 Сразу обновляем весь список маршрута
                refetch();
              }}
            />
          )}
          {selectedDeparture?.busLine && timeEditType && (
            <TimeEditModal
              isOpen={isTimeEditModalOpen}
              onClose={() => {
                setIsTimeEditModalOpen(false);
                setSelectedDeparture(null);
                setTimeEditType(null);
              }}
              busLineId={selectedDeparture.busLine.id}
              busLineNumber={selectedDeparture.busLine.number}
              routeId={routeId}
              timeType={timeEditType}
              onSuccess={() => refetch()}
            />
          )}
          <SecondShiftModal
            isOpen={isSecondShiftModalOpen}
            onClose={() => { setIsSecondShiftModalOpen(false); setSelectedDeparture(null); }}
            departure={selectedDeparture}
            convoyId={auth?.convoyId ?? ""}
            date={dateString}
            onSave={(driverId: string, shiftTime: string) => {
              if (!selectedDeparture) return;
              setDepartures((prev) =>
                prev.map((d) =>
                  d.id === selectedDeparture.id
                    ? { ...d, shift2Driver: { id: driverId, fullName: "", serviceNumber: "", driverStatus: "DayOff" }, shift2Time: shiftTime, isModified: true }
                    : d
                )
              );
              setIsSecondShiftModalOpen(false);
            }}
          />

          <EditAssignmentModal
            isOpen={isEditAssignmentModalOpen}
            onClose={() => { setIsEditAssignmentModalOpen(false); setSelectedDeparture(null); }}
            departure={selectedDeparture}
            convoyId={auth?.convoyId ?? ""}
            date={dateString}
            onSave={(updated) => {
              if (!updated) return;
              setDepartures((prev) =>
                prev.map((d) => d.id === updated.id ? {
                  ...updated,
                  shift2Time: updated.shift2Time ?? "",
                  shift2AdditionalInfo: updated.shift2AdditionalInfo ?? "",
                  isModified: true,
                } : d)
              );
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
            <Button onClick={() => pendingNavigation && router.push(pendingNavigation)}>Выйти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
