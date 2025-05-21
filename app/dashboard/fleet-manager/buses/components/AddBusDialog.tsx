"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check, UserMinus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import type { Bus } from "@/types/bus.types";
import type { Driver, DriverFilterRequest } from "@/types/driver.types";
import { driverService } from "@/service/driverService";
import { getBusStatusLabel } from "../utils/busStatusUtils";

interface AddBusDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (bus: Omit<Bus, "id">, driverIds: string[]) => void;
}

export default function AddBusDialog({ open, onClose, onAdd }: AddBusDialogProps) {
  const [formData, setFormData] = useState<Omit<Bus, "id">>({
    garageNumber: "",
    govNumber: "",
    busStatus: "OnWork",
    additionalInfo: "",
    convoyId: "",
  });

  const [activeTab, setActiveTab] = useState("info");
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState("");

  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { convoyId } = JSON.parse(authData);
      setFormData((prev) => ({ ...prev, convoyId: convoyId || "" }));
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "drivers" || !formData.convoyId) return;

    const loadDrivers = async () => {
      try {
        setLoadingDrivers(true);
        const res = await driverService.filter({
          convoyId: formData.convoyId,
          page: 1,
          pageSize: 1000,
          fullName: null,
          serviceNumber: null,
          address: null,
          phone: null,
          driverStatus: null,
        });

        if (res.isSuccess && res.value && Array.isArray(res.value.items)) {
          setAvailableDrivers(res.value.items);
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

    loadDrivers();
  }, [activeTab, formData.convoyId]);

  const handleChange = (field: keyof Omit<Bus, "id">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignDriver = (driver: Driver) => {
    setSelectedDrivers((prev) => [...prev, driver]);
    setAvailableDrivers((prev) => prev.filter((d) => d.id !== driver.id));
  };

  const handleRemoveDriver = (driver: Driver) => {
    setAvailableDrivers((prev) => [...prev, driver]);
    setSelectedDrivers((prev) => prev.filter((d) => d.id !== driver.id));
  };

  const handleSubmit = () => {
    if (!formData.garageNumber.trim()) {
      toast({ title: "Ошибка", description: "Гаражный номер обязателен.", variant: "destructive" });
      return;
    }
    onAdd(formData, selectedDrivers.map((d) => d.id!));
    setFormData((prev) => ({ ...prev, garageNumber: "", govNumber: "", additionalInfo: "" }));
    setSelectedDrivers([]);
    setActiveTab("info");
  };

  const filteredAvailableDrivers = availableDrivers.filter((driver) => {
    if (!driverSearchQuery) return true;
    const search = driverSearchQuery.toLowerCase();
    return driver.fullName.toLowerCase().includes(search) || driver.serviceNumber.toLowerCase().includes(search);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Добавить новый автобус</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="drivers">Водители</TabsTrigger>
          </TabsList>

          {/* Информация об автобусе */}
          <TabsContent value="info" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="garageNumber">Гаражный номер *</Label>
              <Input id="garageNumber" value={formData.garageNumber} onChange={(e) => handleChange("garageNumber", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="govNumber">Гос. номер</Label>
              <Input id="govNumber" value={formData.govNumber} onChange={(e) => handleChange("govNumber", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="busStatus">Статус</Label>
              <Select value={formData.busStatus} onValueChange={(value) => handleChange("busStatus", value)}>
                <SelectTrigger id="busStatus">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OnWork">На линии</SelectItem>
                  <SelectItem value="UnderRepair">На ремонте</SelectItem>
                  <SelectItem value="LongTermRepair">Длительный ремонт</SelectItem>
                  <SelectItem value="Decommissioned">Списан</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Дополнительная информация</Label>
              <Textarea id="additionalInfo" value={formData.additionalInfo} onChange={(e) => handleChange("additionalInfo", e.target.value)} className="min-h-[100px]" />
            </div>
          </TabsContent>

          {/* Назначение водителей */}
          <TabsContent value="drivers" className="space-y-4 py-4">
            <Input placeholder="Поиск по табельному номеру или ФИО..." value={driverSearchQuery} onChange={(e) => setDriverSearchQuery(e.target.value)} />

            {/* Назначенные */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Назначенные водители:</h3>
              <ScrollArea className="h-48 rounded-md border p-2">
                {selectedDrivers.length > 0 ? (
                  selectedDrivers.map((driver) => (
                    <Button key={driver.id} variant="secondary" className="w-full justify-between" onClick={() => handleRemoveDriver(driver)}>
                      № {driver.serviceNumber} — {driver.fullName}
                      <UserMinus className="h-4 w-4 text-red-500" />
                    </Button>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500">Нет назначенных водителей</p>
                )}
              </ScrollArea>
            </div>

            {/* Доступные */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Доступные водители:</h3>
              <ScrollArea className="h-48 rounded-md border p-2">
                {loadingDrivers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  filteredAvailableDrivers.length > 0 ? (
                    filteredAvailableDrivers.map((driver) => (
                      <Button key={driver.id} variant="outline" className="w-full justify-between" onClick={() => handleAssignDriver(driver)}>
                        № {driver.serviceNumber} — {driver.fullName}
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    ))
                  ) : (
                    <p className="text-center text-sm text-gray-500">Нет доступных водителей</p>
                  )
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
