"use client";

import { useEffect, useState, useCallback } from "react";
import { busService } from "@/service/busService";
import type { Bus, BusWithDrivers } from "@/types/bus.types";
import { toast } from "@/components/ui/use-toast";
import { useAuthData } from "./useAuthData";
import { useDebounce } from "./useDebounce";

export const useBuses = (selectedStatus: string | null, searchQuery: string) => {
  const { getConvoyId } = useAuthData();
  const convoyId = getConvoyId();

  const [buses, setBuses] = useState<BusWithDrivers[]>([]);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchBuses = useCallback(async () => {
    if (!convoyId) return;
    try {
      setLoading(true);

      const params: {
        convoyId: string;
        page: number;
        pageSize: number;
        busStatus?: string | null;
        govNumber?: string | null;
        garageNumber?: string | null;
      } = {
        convoyId,
        page: currentPage,
        pageSize,
        busStatus: selectedStatus || null,
      };

      if (debouncedSearch) {
        if (/^\d+$/.test(debouncedSearch)) {
          params.garageNumber = debouncedSearch;
        } else {
          params.govNumber = debouncedSearch;
        }
      }

      console.log("🚍 Параметры запроса:", params);

      const result = await busService.filter(params);

      setBuses(result.items || []);
      setTotalPages(Math.ceil((result.totalCount ?? 0) / pageSize));
    } catch (err) {
      console.error("Ошибка при загрузке автобусов:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список автобусов. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [convoyId, selectedStatus, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleAddBus = async (newBus: Omit<Bus, "id">, driverIds: string[] = []) => {
    try {
      const createdId = await busService.create({ ...newBus, driverIds });
      if (createdId) {
        await fetchBuses();
      }
      return createdId;
    } catch (err) {
      console.error("Ошибка при добавлении автобуса:", err);
      return null;
    }
  };

  const handleUpdateBus = async (updated: Bus) => {
    try {
      await busService.update(updated.id, updated);
      await fetchBuses();
    } catch (err) {
      console.error("Ошибка при обновлении автобуса:", err);
    }
  };

  const handleDeleteBus = async (id: string) => {
    try {
      await busService.delete(id);
      await fetchBuses();
    } catch (err) {
      console.error("Ошибка при удалении автобуса:", err);
    }
  };

  const assignDriverToBus = async (driverId: string, busId: string) => {
    await busService.assignDrivers(busId, [driverId]);
    await fetchBuses();
  };

  const removeDriverFromBus = async (driverId: string, busId: string) => {
    await busService.removeDriver(busId, driverId);
    await fetchBuses();
  };

  const getBusWithDrivers = (id: string) => buses.find((bus) => bus.id === id);

  const refetchBuses = useCallback(() => {
    fetchBuses();
  }, [fetchBuses]);

  return {
    buses,
    totalPages,
    currentPage,
    setCurrentPage,
    handleAddBus,
    handleUpdateBus,
    handleDeleteBus,
    assignDriverToBus,
    removeDriverFromBus,
    getBusWithDrivers,
    loading,
    refetchBuses,
  };
};
