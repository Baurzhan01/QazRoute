"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import { formatDateLabel, parseDate } from "../../../../utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import ReserveTable from "./components/ReserveTable";
import AssignmentDialog from "./components/AssignmentDialog";
import { v4 as uuidv4 } from "uuid";

import type { ReserveDepartureUI } from "@/types/reserve.types";
import type { DisplayDriver } from "@/types/driver.types";
import type { DisplayBus } from "@/types/bus.types";
import { releasePlanService } from "@/service/releasePlanService";
import { useBeforeUnload } from "react-use";

export default function ReservePage() {
  const params = useParams();
  const router = useRouter();
  const dateString = params.date as string;
  const dayType = params.dayType as string;
  const date = useMemo(() => parseDate(dateString), [dateString]);

  const localAuth = useMemo(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("authData") ?? "{}");
    }
    return {};
  }, []);
  const convoyId = (params.convoyId as string) || localAuth?.convoyId;

  const [departures, setDepartures] = useState<ReserveDepartureUI[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<ReserveDepartureUI | null>(null);
  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null);
  const [busSearchQuery, setBusSearchQuery] = useState("");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useBeforeUnload(hasChanges, "У вас есть несохранённые изменения. Вы уверены, что хотите покинуть страницу?");

  // 🚚 Загрузка резерва с сервера
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await releasePlanService.getReservesByDate(dateString);
        const reserves = res.value ?? [];

        if (reserves.length) {
          setDepartures(
            reserves.map((r: any, index: number) => ({
              id: r.id ?? uuidv4(),
              sequenceNumber: index + 1,
              departureTime: "",
              scheduleTime: "",
              endTime: r.endTime ?? "",
              bus: r.busId
                ? {
                    id: r.busId,
                    garageNumber: r.garageNumber,
                    govNumber: r.govNumber,
                    status: "OnWork",
                    convoyId: convoyId,
                  }
                : undefined,
              driver: r.driverTabNumber
                ? {
                    id: r.driverId,
                    fullName: r.driverFullName,
                    serviceNumber: r.driverTabNumber,
                    convoyId: convoyId,
                    driverStatus: "OnWork",
                  }
                : undefined,
              additionalInfo: r.description ?? "",
            }))
          );
        } else {
          // Если ничего нет — покажем 5 пустых строк
          setDepartures(
            Array.from({ length: 5 }).map((_, index) => ({
              id: uuidv4(),
              sequenceNumber: index + 1,
              departureTime: "",
              scheduleTime: "",
              endTime: "",
            }))
          );
        }
      } catch (error) {
        toast({ title: "Ошибка", description: "Не удалось загрузить резерв", variant: "destructive" });
      }
    };

    loadData();
  }, [dateString]);

  const handleOpenAddDialog = (departure: ReserveDepartureUI) => {
    setSelectedDeparture(departure);
    setSelectedBus(null);
    setSelectedDriver(null);
    setBusSearchQuery("");
    setDriverSearchQuery("");
    setIsAddDialogOpen(true);
  };

  const handleUpdateAssignment = (updated: ReserveDepartureUI) => {
    setDepartures((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setHasChanges(true);
  };

  const handleRemoveAssignment = (departureId: string) => {
    setDepartures((prev) =>
      prev.map((d) =>
        d.id === departureId ? { ...d, bus: undefined, driver: undefined } : d
      )
    );
    setHasChanges(true);
  };

  // 🆕 Локальное добавление строки (не отправляется на сервер)
  const handleAddLocalRow = () => {
    setDepartures((prev) => [
      ...prev,
      {
        id: uuidv4(),
        sequenceNumber: prev.length + 1,
        departureTime: "",
        scheduleTime: "",
        endTime: "",
        bus: undefined,
        driver: undefined,
        additionalInfo: "",
        isEmptyRow: false, // ❗️ ВАЖНО: чтобы таблица показывала кнопку «Назначить»
      },
    ])
    setHasChanges(true)
  }
  

  const handleSaveAll = async () => {
    try {
      const assignments = departures
        .filter((d) => d.bus || d.driver)
        .map((d) => ({
          driverId: d.driver?.id ?? null,
          busId: d.bus?.id ?? null,
          driverFullName: d.driver?.fullName ?? "",
          driverTabNumber: d.driver?.serviceNumber ?? "",
          garageNumber: d.bus?.garageNumber ?? "",
          govNumber: d.bus?.govNumber ?? "",
          description: d.additionalInfo ?? "",
          endTime: d.endTime ?? "",
          dispatchBusLineId: d.id,
        }));

      if (assignments.length > 0) {
        await releasePlanService.assignReserve(dateString, assignments);
      }

      toast({ title: "Сохранено", description: "Назначения сохранены" });
      setHasChanges(false);
      router.push(`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}`);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить резерв", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Резерв водителей</h1>
          <p className="text-gray-500">{formatDateLabel(date)}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="bg-gray-800 text-white">
            <CardTitle>Резерв</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ReserveTable
              departures={departures}
              onAddAssignment={handleOpenAddDialog}
              onRemoveAssignment={handleRemoveAssignment}
              onUpdateDepartures={setDepartures}
              onUpdateAssignment={handleUpdateAssignment}
              date={dateString}
              onReload={() => location.reload()}
              convoyId={convoyId}
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
        <Button onClick={handleAddLocalRow}>
          <Plus className="h-4 w-4" />
          Добавить строку
        </Button>
          <Button onClick={handleSaveAll}>
            <Save className="h-4 w-4" />
            Сохранить
          </Button>
        </div>

        <AssignmentDialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          selectedDeparture={selectedDeparture}
          selectedBus={selectedBus}
          selectedDriver={selectedDriver}
          busSearchQuery={busSearchQuery}
          driverSearchQuery={driverSearchQuery}
          onBusSearchChange={setBusSearchQuery}
          onDriverSearchChange={setDriverSearchQuery}
          onSelectBus={setSelectedBus}
          onSelectDriver={setSelectedDriver}
          convoyId={convoyId}
          date={dateString}
          onSave={(bus, driver) => {
            if (!selectedDeparture) return;
            setDepartures((prev) =>
              prev.map((d) =>
                d.id === selectedDeparture.id
                  ? { ...d, bus: bus ?? undefined, driver: driver ?? undefined }
                  : d
              )
            );
            setHasChanges(true);
          }}
        />
      </motion.div>
    </div>
  );
}
