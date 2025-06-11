import { useState, useEffect } from "react";
import { convoyService } from "@/service/convoyService";
import { authService } from "@/service/authService";
import { toast } from "@/components/ui/use-toast";
import type { Convoy, ConvoyFormData, User } from "../types";

interface UseConvoysProps {
  depotId: string;
  updateUserConvoy: (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => void;
  users: User[];
}

export const useConvoys = ({ depotId, updateUserConvoy, users }: UseConvoysProps) => {
  const [managedConvoys, setManagedConvoys] = useState<Convoy[]>([]);
  const [selectedConvoy, setSelectedConvoy] = useState<Convoy | null>(null);
  const [newConvoyData, setNewConvoyData] = useState<ConvoyFormData>({
    number: "",
    chiefId: "not-assigned",
    mechanicId: "not-assigned",
  });

  // Загрузка автоколонн по depotId
  useEffect(() => {
    const fetchConvoys = async () => {
      try {
        const response = await convoyService.getByDepotId(depotId);
        if (response.isSuccess && response.value) {
          setManagedConvoys(response.value);
        } else {
          toast({ title: "Ошибка", description: "Не удалось загрузить автоколонны: " + response.error, variant: "destructive" });
        }
      } catch (error) {
        console.error("Ошибка загрузки автоколонн:", error);
        toast({ title: "Ошибка", description: "Произошла ошибка при загрузке автоколонн", variant: "destructive" });
      }
    };
    if (depotId) fetchConvoys();
  }, [depotId]);

  const handleConvoyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewConvoyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewConvoyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddConvoy = async () => {
    const { number, chiefId, mechanicId } = newConvoyData;
    if (!number) {
      toast({ title: "Ошибка", description: "Заполните номер.", variant: "destructive" });
      return false;
    }
  
    const convoyData: any = {
      number: Number(number),
      busDepotId: depotId,
    };
    if (chiefId && chiefId !== "not-assigned") convoyData.chiefId = chiefId;
    if (mechanicId && mechanicId !== "not-assigned") convoyData.mechanicId = mechanicId;
  
    // Создаем автоколонну
    const createResponse = await convoyService.create(convoyData);
  
    if (!createResponse.isSuccess || !createResponse.value) {
      toast({ title: "Ошибка", description: createResponse.error || "Не удалось создать автоколонну", variant: "destructive" });
      return false;
    }
  
    // Получаем полные данные автоколонны по id
    const convoyId = createResponse.value; // id автоколонны
    const getResponse = await convoyService.getById(convoyId);
  
    if (getResponse.isSuccess && getResponse.value) {
      const newConvoy = getResponse.value;
      setManagedConvoys((prev) => [...prev, newConvoy]);
      setNewConvoyData({ number: "", chiefId: "not-assigned", mechanicId: "not-assigned" });
  
      // Обновляем convoyId у пользователей, если они назначены
      const chief = users.find((u) => u.id === chiefId);
        if (chiefId && chiefId !== "not-assigned" && chief) {
          await authService.updateUser(chiefId, {
            fullName: chief.fullName,
            role: "FleetManager"
          });
          updateUserConvoy(chiefId, newConvoy.id, newConvoy.number);
        }
        const mechanic = users.find((u) => u.id === mechanicId);
        if (mechanicId && mechanicId !== "not-assigned" && mechanic) {
          await authService.updateUser(mechanicId, {
            fullName: mechanic.fullName,
            role: "Mechanic",
          });
          updateUserConvoy(mechanicId, newConvoy.id, newConvoy.number);
        }
  
      return true;
    } else {
      toast({ title: "Ошибка", description: getResponse.error || "Не удалось получить данные автоколонны", variant: "destructive" });
      return false;
    }
  };

  const handleEditConvoy = async () => {
    if (!selectedConvoy) return false;
  
    const { number, chiefId, mechanicId } = newConvoyData;
    const convoyData: any = {
      number: Number(number) || selectedConvoy.number,
      busDepotId: selectedConvoy.busDepotId,
    };
    if (chiefId && chiefId !== "not-assigned") convoyData.chiefId = chiefId;
    if (mechanicId && mechanicId !== "not-assigned") convoyData.mechanicId = mechanicId;
  
    const response = await convoyService.update(selectedConvoy.id, convoyData);
  
    if (response.isSuccess && response.value) {
      const updatedConvoy = response.value;
      setManagedConvoys((prev) =>
        prev.map((convoy) => (convoy.id === selectedConvoy.id ? updatedConvoy : convoy))
      );
  
      // Обновляем convoyId у пользователей
      const oldChiefId = selectedConvoy.chiefId;
      const oldMechanicId = selectedConvoy.mechanicId;
  
      if (chiefId && chiefId !== oldChiefId) {
        const chief = users.find((u: User) => u.id === chiefId);
        if (chief) {
          await authService.updateUser(chiefId, {
            fullName: chief.fullName,
            role: "FleetManager"
          });
          updateUserConvoy(chiefId, updatedConvoy.id, updatedConvoy.number);
        }
      }
      if (oldChiefId && chiefId !== oldChiefId) {
        const oldChief = users.find((u: User) => u.id === oldChiefId);
        if (oldChief) {
          await authService.updateUser(oldChiefId, {
            fullName: oldChief.fullName,
            role: "FleetManager",
          });
          updateUserConvoy(oldChiefId, undefined, undefined);
        }
      }
  
      if (mechanicId && mechanicId !== oldMechanicId) {
        const mechanic = users.find((u: User) => u.id === mechanicId);
        if (mechanic) {
          await authService.updateUser(mechanicId, {
            fullName: mechanic.fullName,
            role: "Mechanic",
          });
          updateUserConvoy(mechanicId, updatedConvoy.id, updatedConvoy.number);
        }
      }
      if (oldMechanicId && mechanicId !== oldMechanicId) {
        const oldMechanic = users.find((u: User) => u.id === oldMechanicId);
        if (oldMechanic) {
          await authService.updateUser(oldMechanicId, {
            fullName: oldMechanic.fullName,
            role: "Mechanic",
          });
          updateUserConvoy(oldMechanicId, undefined, undefined);
        }
      }
  
      setNewConvoyData({ number: "", chiefId: "not-assigned", mechanicId: "not-assigned" });
      setSelectedConvoy(null);
      return true;
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить автоколонну: " + response.error,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteConvoy = async () => {
    if (!selectedConvoy) return false;

    const response = await convoyService.delete(selectedConvoy.id);
    if (response.isSuccess) {
      setManagedConvoys((prev) => prev.filter((convoy) => convoy.id !== selectedConvoy.id));
      setSelectedConvoy(null);
      return true;
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить автоколонну: " + response.error,
        variant: "destructive",
      });
      return false;
    }
  };

  const openEditConvoyDialog = (convoy: Convoy) => {
    setSelectedConvoy(convoy);
    const newData = {
      id: convoy.id,
      number: convoy.number.toString(),
      chiefId: convoy.chiefId || convoy.chief?.id || "not-assigned",
      mechanicId: convoy.mechanicId || convoy.mechanic?.id || "not-assigned",
    };
    setNewConvoyData(newData);
  };

  const openViewConvoyDialog = (convoy: Convoy) => {
    setSelectedConvoy(convoy);
  };

  const updateConvoys = (convoyId: string, userId: string, role: string) => {
    setManagedConvoys((prev) =>
      prev.map((convoy) =>
        convoy.id === convoyId
          ? {
              ...convoy,
              chiefId: role === "fleetManager" ? userId : convoy.chiefId,
              mechanicId: role === "mechanic" ? userId : convoy.mechanicId,
            }
          : convoy
      )
    );
  };

  return {
    convoys: managedConvoys,
    selectedConvoy,
    newConvoyData,
    handleConvoyFormChange,
    handleSelectChange,
    handleAddConvoy,
    handleEditConvoy,
    handleDeleteConvoy,
    openEditConvoyDialog,
    openViewConvoyDialog,
    updateConvoys,
  };
};