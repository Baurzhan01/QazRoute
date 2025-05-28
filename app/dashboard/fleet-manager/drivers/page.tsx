"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDebounce } from "./hooks/useDebounce"
import { useDrivers } from "./hooks/useDrivers"

import DriversList from "./components/DriversList"
import AddDriverDialog from "./components/AddDriverDialog"
import EditDriverDialog from "./components/EditDriverDialog"
import DeleteDriverDialog from "./components/DeleteDriverDialog"
import ViewDriverDialog from "./components/ViewDriverDialog"
import type { Driver, DriverStatus } from "@/types/driver.types"
import { useSearchParams, useRouter } from "next/navigation"


export default function DriversPage() {
  const [rawSearch, setRawSearch] = useState("")
  const debouncedSearch = useDebounce(rawSearch, 100)

  const {
    drivers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    inReserve,
    busInfo,
    statusCounts,
    selectedStatus,
    addDriver,
    updateDriver,
    deleteDriver,
    changePage,
    toggleReserve,
    addToReserve,
    removeFromReserve,
    filterByStatus,
  } = useDrivers()

  useEffect(() => {
    setSearchQuery(debouncedSearch)
  }, [debouncedSearch, setSearchQuery])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  const openAddDialog = () => setIsAddDialogOpen(true)
  const openEditDialog = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsEditDialogOpen(true)
  }
  const openDeleteDialog = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsDeleteDialogOpen(true)
  }
  const openViewDialog = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsViewDialogOpen(true)
  }

  const handleAddToReserve = (driver: Driver) => {
    if (driver.id) addToReserve(driver.id)
  }

  const handleRemoveFromReserve = (driver: Driver) => {
    if (driver.id) removeFromReserve(driver.id)
  }
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get("status") as DriverStatus | null
  const dateParam = searchParams.get("date")

  
  useEffect(() => {
    if (initialStatus) {
      filterByStatus(initialStatus)
    }
  }, [initialStatus])
  

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/fleet-manager">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {searchParams.get("status") && dateParam && (
          <Link href={`/dashboard/fleet-manager/release-plan/workday/by-date/${dateParam}/final-dispatch`}>
            <Button variant="ghost" className="mb-2 text-blue-600 hover:underline">
              ← Назад к разнарядке
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-amber-500">Управление водителями</h1>
          <p className="text-gray-500 mt-1">Информация о водителях, графики работы и статусы</p>
        </div>
      </div>

      <DriversList
        drivers={drivers}
        loading={loading}
        error={error}
        searchQuery={rawSearch}                   // 🔍 локальный ввод
        onSearchChange={setRawSearch}             // 🔄 изменение строки поиска
        onAddClick={openAddDialog}
        onEditClick={openEditDialog}
        onDeleteClick={openDeleteDialog}
        onViewClick={openViewDialog}
        onAddToReserveClick={handleAddToReserve}
        onRemoveFromReserveClick={handleRemoveFromReserve}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={changePage}
        inReserve={inReserve}
        onReserveToggle={toggleReserve}
        busInfo={busInfo}
        statusCounts={statusCounts}
        selectedStatus={selectedStatus}
        onStatusFilter={filterByStatus}
      />

      <AddDriverDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={addDriver}
      />

      <EditDriverDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        driver={selectedDriver}
        onSubmit={updateDriver}
      />

      <DeleteDriverDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        driver={selectedDriver}
        onConfirm={async (id) => {
          const success = await deleteDriver(id)
          if (success) setIsDeleteDialogOpen(false)
          return success
        }}
      />

      <ViewDriverDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        driver={selectedDriver}
        busInfo={
          selectedDriver?.busId && busInfo[selectedDriver.busId]
            ? busInfo[selectedDriver.busId]
            : null
        }
      />
    </div>
  )
}
