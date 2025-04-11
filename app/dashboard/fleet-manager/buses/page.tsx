"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import BusStatusStats from "./components/BusStatusStats"
import BusSearchBar from "./components/BusSearchBar"
import BusList from "./components/BusList"
import ViewBusDialog from "./components/ViewBusDialog"
import EditBusDialog from "./components/EditBusDialog"
import AddBusDialog from "./components/AddBusDialog"
import { useBuses } from "./hooks/useBuses"
import { useBusStats } from "./hooks/useBusStats"
import type { Bus } from "@/types/bus.types"
import { motion } from "framer-motion"
import { getBusStatusLabel } from "./utils/busStatusUtils"
import type { BusStatus } from "@/types/bus.types"

export default function BusesPage() {
  const [viewBusId, setViewBusId] = useState<string | null>(null)
  const [editBusId, setEditBusId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const {
    buses,
    totalPages,
    currentPage,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    handleDeleteBus,
    handleUpdateBus,
    handleAddBus,
    getBusWithDrivers,
    assignDriverToBus,
    removeDriverFromBus,
    loading, // 👈 добавить сюда
    refetchBuses
  } = useBuses(selectedStatus)
  

  const convoyId =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("authData") || "{}").convoyId
    : null

const { data: busStats, isLoading: isStatsLoading } = useBusStats(convoyId)

  const viewBus = viewBusId ? getBusWithDrivers(viewBusId) : null
  const editBus = editBusId ? getBusWithDrivers(editBusId) : null

  const handleOpenViewDialog = (busId: string) => {
    setViewBusId(busId)
  }

  const handleCloseViewDialog = () => {
    setViewBusId(null)
  }

  const handleOpenEditDialog = (busId: string) => {
    setEditBusId(busId)
  }

  const handleCloseEditDialog = () => {
    setEditBusId(null)
  }

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true)
  }

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false)
  }

  const handleSaveEditBus = async (updatedBus: Bus) => {
    await handleUpdateBus(updatedBus)
    handleCloseEditDialog()
    refetchBuses()
  }
  

  // Обновляем функцию handleAddNewBus, чтобы она принимала также список ID водителей
  const handleAddNewBus = async (
    newBus: Omit<Bus, "id">,
    driverIds: string[] = []
  ) => {
    const busid = await handleAddBus(newBus, driverIds)
  
    if (!busid ) {
      console.error("❌ Автобус не создан или не имеет ID")
      return
    }
  
    handleCloseAddDialog()
  }
  
  

  const handleStatusSelect = (status: string | null) => {
    if (status === selectedStatus) {
      setSelectedStatus(null)
    } else {
      setSelectedStatus(status)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <motion.h1
            className="text-3xl font-bold tracking-tight text-sky-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Управление автобусами
          </motion.h1>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить автобус
          </Button>
        </div>

        {selectedStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-gray-500"
          >
            Применен фильтр: {getBusStatusLabel(selectedStatus as BusStatus)}
            <Button variant="link" size="sm" onClick={() => setSelectedStatus(null)} className="ml-2 h-auto p-0">
              Сбросить
            </Button>
          </motion.div>
        )}
      </div>

      <BusStatusStats
        stats={busStats}
        isLoading={isStatsLoading}
        selectedStatus={selectedStatus}
        onStatusSelect={handleStatusSelect}
      />


      <BusSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <BusList
        buses={buses}
        loading={loading} // 👈 вот он!
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={handleOpenViewDialog}
        onEdit={handleOpenEditDialog}
        onDelete={handleDeleteBus}
        onAssignDriver={(busId) => handleOpenEditDialog(busId)}
      />
      
      {viewBus && <ViewBusDialog bus={viewBus} open={!!viewBusId} onClose={handleCloseViewDialog} />}

      {editBus && (
        <EditBusDialog bus={editBus} open={!!editBusId} onClose={handleCloseEditDialog} refetch={() => refetchBuses()} />
      )}

      <AddBusDialog open={isAddDialogOpen} onClose={handleCloseAddDialog} onAdd={handleAddNewBus} />
    </div>
  )
}

