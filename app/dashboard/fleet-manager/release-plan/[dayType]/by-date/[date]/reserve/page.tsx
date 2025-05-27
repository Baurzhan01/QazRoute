"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();

  const dateString = params.date as string;
  const dayType = params.dayType as string;
  const from = searchParams.get("from");

  const date = useMemo(() => parseDate(dateString), [dateString]);

  const localAuth = useMemo(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("authData") ?? "{}");
    }
    return {};
  }, []);
  const convoyId = (params.convoyId as string) || localAuth?.convoyId;

  const [departures, setDepartures] = useState<ReserveDepartureUI[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<ReserveDepartureUI | null>(null);
  const [selectedBus, setSelectedBus] = useState<DisplayBus | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DisplayDriver | null>(null);
  const [busSearchQuery, setBusSearchQuery] = useState("");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useBeforeUnload(hasChanges, "У вас есть несохранённые изменения. Вы уверены, что хотите покинуть страницу?");

  const loadData = async () => {
    try {
      const res = await releasePlanService.getReserveAssignmentsByDate(dateString, convoyId);
      const reserves = res.value ?? [];

      setDepartures(
        reserves.map((r: any, index: number) => ({
          id: r.id ?? uuidv4(),
          sequenceNumber: r.sequenceNumber ?? index + 1,
          departureTime: r.departureTime ?? "",
          scheduleTime: r.scheduleTime ?? "",
          endTime: r.endTime ?? "",
          bus: r.busId
            ? {
                id: r.busId,
                garageNumber: r.garageNumber,
                govNumber: r.govNumber,
                busStatus: "OnWork", // обязательно!
                convoyId,
              }
            : undefined,
          driver: r.driverTabNumber
            ? {
                id: r.driverId,
                fullName: r.driverFullName,
                serviceNumber: r.driverTabNumber,
                convoyId,
                driverStatus: "OnWork",
              }
            : undefined,
          additionalInfo: r.description ?? "",
        }))
      );
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить резерв", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadData();
  }, [dateString]);

  const handleOpenDialog = (departure: ReserveDepartureUI | null = null) => {
    setSelectedDeparture(departure);
    setSelectedBus(departure?.bus ?? null);
    setSelectedDriver(departure?.driver ?? null);
    setBusSearchQuery("");
    setDriverSearchQuery("");
    setIsDialogOpen(true);
  };

  const handleSave = async (bus: DisplayBus | null, driver: DisplayDriver | null) => {
    try {
      await loadData();
      toast({ title: "Сохранено" });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить резерв",
        variant: "destructive",
      });
    }
  };

  const backHref =
    from === "final-dispatch"
      ? `/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}/final-dispatch`
      : `/dashboard/fleet-manager/release-plan/${dayType}/by-date/${dateString}`;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href={backHref}>
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
          <CardHeader className="bg-gray-800 text-white flex justify-between items-center">
            <CardTitle>Резерв</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="bg-white text-black hover:bg-gray-100"
                onClick={async () => {
                  try {
                    await releasePlanService.assignReserve(
                      dateString,
                      [{ busId: null, driverId: null, description: null }],
                      convoyId
                    );
                    toast({ title: "Пустое поле добавлено" });
                    await loadData();
                  } catch {
                    toast({
                      title: "Ошибка",
                      description: "Не удалось добавить пустое поле",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Добавить пустое поле
              </Button>
              <Button
                variant="secondary"
                className="bg-white text-black hover:bg-gray-100"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-1" /> Добавить в резерв
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ReserveTable
              departures={departures}
              onEditAssignment={handleOpenDialog}
              date={dateString}
              onReload={loadData}
              convoyId={convoyId}
            />
          </CardContent>
        </Card>

        <AssignmentDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
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
          onSave={handleSave}
        />
      </motion.div>
    </div>
  );
}
