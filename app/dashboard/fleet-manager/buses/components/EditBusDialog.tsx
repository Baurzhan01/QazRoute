"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check, Loader2, UserMinus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { busService } from "@/service/busService";
import { driverService } from "@/service/driverService";
import { getBusStatusLabel } from "../utils/busStatusUtils";
import { formatShortName } from "../utils/formatShortName";

import type { Bus, BusStatus, BusWithDrivers } from "@/types/bus.types";
import type { Driver, DriverFilterRequest } from "@/types/driver.types";

interface EditBusDialogProps {
  bus: BusWithDrivers;
  open: boolean;
  onClose: () => void;
  refetch: () => void;
}

export default function EditBusDialog({ bus, open, onClose, refetch }: EditBusDialogProps) {
  const [updatedBus, setUpdatedBus] = useState<Bus>({ ...bus });
  const [assignedDrivers, setAssignedDrivers] = useState<Driver[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    setUpdatedBus({ ...bus });
    setAssignedDrivers(bus.drivers as Driver[]);
  }, [bus]);

  useEffect(() => {
    const loadAvailableDrivers = async () => {
      try {
        setLoadingDrivers(true);

        const auth = localStorage.getItem("authData");
        const convoyId = auth ? JSON.parse(auth)?.convoyId : null;
        if (!convoyId) return;

        const filter: DriverFilterRequest = {
          convoyId,
          page: 1,
          pageSize: 1000,
          fullName: null,
          serviceNumber: null,
          address: null,
          phone: null,
          driverStatus: null,
        };

        const res = await driverService.filter(filter);

        if (res.isSuccess && res.value && Array.isArray(res.value.items)) {
          const assignedIds = new Set(bus.drivers.map((d) => d.id));
          const available = res.value.items.filter((d) => !assignedIds.has(d.id));
          setAvailableDrivers(available);
        } else {
          toast({ title: "Ошибка", description: "Не удалось загрузить водителей.", variant: "destructive" });
        }
      } catch (error) {
        console.error(error);
        toast({ title: "Ошибка", description: "Ошибка при загрузке водителей.", variant: "destructive" });
      } finally {
        setLoadingDrivers(false);
      }
    };

    if (activeTab === "drivers") {
      loadAvailableDrivers();
    }
  }, [activeTab, bus.drivers]);

  const handleChange = (field: keyof Omit<Bus, "id">, value: string) => {
    setUpdatedBus((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignDriver = async (driverId: string) => {
    await busService.assignDrivers(bus.id, [driverId]);
    refetch();
  };

  const handleUnassignDriver = async (driverId: string) => {
    await busService.removeDriver(bus.id, driverId);
    refetch();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await busService.update(bus.id, updatedBus);
      refetch();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const filteredAvailableDrivers = availableDrivers.filter((driver) => {
    if (!driverSearchQuery) return true;
    const search = driverSearchQuery.toLowerCase();
    return driver.fullName.toLowerCase().includes(search) || driver.serviceNumber.toLowerCase().includes(search);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Редактировать автобус</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="drivers">Водители</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="garageNumber">Гаражный номер</Label>
                <Input id="garageNumber" value={updatedBus.garageNumber} onChange={(e) => handleChange("garageNumber", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="govNumber">Гос. номер</Label>
                <Input id="govNumber" value={updatedBus.govNumber} onChange={(e) => handleChange("govNumber", e.target.value)} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="busStatus">Статус</Label>
                <Select value={updatedBus.busStatus} onValueChange={(value) => handleChange("busStatus", value)}>
                  <SelectTrigger id="busStatus">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {["OnWork", "UnderRepair", "LongTermRepair", "DayOff", "Decommissioned"].map((status) => (
                      <SelectItem key={status} value={status}>{getBusStatusLabel(status as BusStatus)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="additionalInfo">Дополнительная информация</Label>
                <Textarea id="additionalInfo" value={updatedBus.additionalInfo} onChange={(e) => handleChange("additionalInfo", e.target.value)} className="min-h-[100px]" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4 py-4">
            <Input placeholder="Поиск по табельному номеру или ФИО..." value={driverSearchQuery} onChange={(e) => setDriverSearchQuery(e.target.value)} className="pl-10" />

            <div className="grid grid-cols-2 gap-4">
              {/* Назначенные водители */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold">Назначенные водители</h4>
                <ScrollArea className="h-64 rounded-md border p-2">
                  <AnimatePresence>
                    {assignedDrivers.length > 0 ? assignedDrivers.map((driver) => (
                      <motion.div key={driver.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                        <Button variant="secondary" className="justify-between w-full" onClick={() => handleUnassignDriver(driver.id!)}>
                          № {driver.serviceNumber} — {formatShortName(driver.fullName)}
                          <UserMinus className="h-4 w-4 text-red-500" />
                        </Button>
                      </motion.div>
                    )) : (
                      <p className="text-center text-gray-500 italic py-6">Нет назначенных</p>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </div>

              {/* Доступные водители */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold">Доступные водители</h4>
                <ScrollArea className="h-64 rounded-md border p-2">
                  {loadingDrivers ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    filteredAvailableDrivers.map((driver) => (
                      <Button key={driver.id} variant="outline" className="justify-between w-full" onClick={() => handleAssignDriver(driver.id!)}>
                        № {driver.serviceNumber} — {formatShortName(driver.fullName)}
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    ))
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
