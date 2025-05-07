"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import BusList from "./components/BusList";
import BusListGrid from "./components/BusListGrid";
import BusSearchBar from "./components/BusSearchBar";
import BusStatusStats from "./components/BusStatusStats";

import ViewBusDialog from "./components/ViewBusDialog";
import EditBusDialog from "./components/EditBusDialog";
import AddBusDialog from "./components/AddBusDialog";

import { useBuses } from "./hooks/useBuses";
import { useBusStats } from "./hooks/useBusStats";
import { useAuthData } from "./hooks/useAuthData";

import { getBusStatusLabel } from "./utils/busStatusUtils";
import type { BusStatus } from "@/types/bus.types";

export default function BusesPage() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [viewBusId, setViewBusId] = useState<string | null>(null);
  const [editBusId, setEditBusId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { getConvoyId } = useAuthData();
  const convoyId = getConvoyId();

  const {
    buses,
    totalPages,
    currentPage,
    setCurrentPage,
    handleDeleteBus,
    handleUpdateBus,
    handleAddBus,
    getBusWithDrivers,
    loading,
    refetchBuses,
  } = useBuses(selectedStatus, searchQuery); // ✅ Передаём searchQuery

  const { data: busStats, isLoading: isStatsLoading } = useBusStats(convoyId ?? undefined);

  const viewBus = viewBusId ? getBusWithDrivers(viewBusId) : null;
  const editBus = editBusId ? getBusWithDrivers(editBusId) : null;

  const handleOpenViewDialog = (busId: string) => setViewBusId(busId);
  const handleCloseViewDialog = () => setViewBusId(null);

  const handleOpenEditDialog = (busId: string) => setEditBusId(busId);
  const handleCloseEditDialog = () => setEditBusId(null);

  const handleOpenAddDialog = () => setIsAddDialogOpen(true);
  const handleCloseAddDialog = () => setIsAddDialogOpen(false);

  const handleSaveEditBus = async (updatedBus: any) => {
    await handleUpdateBus(updatedBus);
    handleCloseEditDialog();
    refetchBuses();
  };

  const handleAddNewBus = async (newBus: any, driverIds: string[] = []) => {
    const busid = await handleAddBus(newBus, driverIds);
    if (!busid) {
      console.error("❌ Автобус не создан или не имеет ID");
      return;
    }
    handleCloseAddDialog();
  };

  const handleStatusSelect = (status: string | null) => {
    setSelectedStatus((prev) => (prev === status ? null : status));
    setSearchQuery(""); // ✅ Сбрасываем поиск при смене фильтра
    setCurrentPage(1);   // Сбрасываем страницу на первую
    window.scrollTo({ top: 0, behavior: "smooth" }); // Плавный скролл наверх
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Скроллим вверх при смене страницы
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold text-sky-700">Управление автобусами</h1>
            <p className="text-gray-500 text-sm">
              Выберите фильтр или выполните поиск для быстрого доступа к автобусам.
            </p>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить автобус
          </Button>
        </div>
      </motion.div>

      {/* Переключатель вида */}
      <div className="flex justify-end mb-2">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewMode(value as "table" | "grid");
          }}
          className="border rounded-lg"
        >
          <ToggleGroupItem value="table" className="px-4 py-2">
            📋 Таблица
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" className="px-4 py-2">
            🧩 Плитка
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Фильтр выбранного статуса */}
      {selectedStatus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 flex items-center gap-2"
        >
          Фильтрация по статусу: <strong>{getBusStatusLabel(selectedStatus as BusStatus)}</strong>
          <Button variant="link" size="sm" onClick={() => handleStatusSelect(null)}>
            Сбросить
          </Button>
        </motion.div>
      )}

      {/* Статистика автобусов */}
      <BusStatusStats
        stats={busStats}
        isLoading={isStatsLoading}
        selectedStatus={selectedStatus}
        onStatusSelect={handleStatusSelect}
      />

      {/* Поиск */}
      <BusSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Список автобусов */}
      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <BusList
              buses={buses}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onView={handleOpenViewDialog}
              onEdit={handleOpenEditDialog}
              onDelete={handleDeleteBus}
              onAssignDriver={handleOpenEditDialog}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <BusListGrid
              buses={buses}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onView={handleOpenViewDialog}
              onEdit={handleOpenEditDialog}
              onDelete={handleDeleteBus}
              refetchBuses={refetchBuses}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Диалоги */}
      {viewBus && (
        <ViewBusDialog bus={viewBus} open={!!viewBusId} onClose={handleCloseViewDialog} />
      )}
      {editBus && (
        <EditBusDialog bus={editBus} open={!!editBusId} onClose={handleCloseEditDialog} refetch={refetchBuses} />
      )}
      <AddBusDialog open={isAddDialogOpen} onClose={handleCloseAddDialog} onAdd={handleAddNewBus} />
    </div>
  );
}
