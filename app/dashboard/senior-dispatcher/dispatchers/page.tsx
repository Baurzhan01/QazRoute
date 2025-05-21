"use client"

import { useState } from "react"
import { useDispatchers } from "./hooks/useDispatchers"
import { DispatcherTable } from "./components/DispatcherTable"
import { DispatcherFiltersComponent } from "./components/DispatcherFilters"
import { DispatcherForm } from "./components/DispatcherForm"
import { DispatcherShiftDialog } from "./components/DispatcherShiftDialog"
import type { Dispatcher, DispatcherStatus, NewDispatcher, DispatcherShift } from "./types/dispatcher.types"
import { authService } from "@/service/authService"

export default function DispatchersPage() {
  const {
    dispatchers,
    loading,
    error,
    filters,
    convoys,
    updateFilters,
    addDispatcher,
    updateDispatcher,
    removeDispatcher,
    changeStatus,
    getDispatcherShifts,
  } = useDispatchers()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false)
  const [selectedDispatcher, setSelectedDispatcher] = useState<Dispatcher | null>(null)
  const [shifts, setShifts] = useState<DispatcherShift[]>([])
  const [shiftsLoading, setShiftsLoading] = useState(false)

  const handleAddDispatcher = async (data: NewDispatcher): Promise<boolean> => {
    const result = await addDispatcher(data)
    if (result) {
      setIsAddModalOpen(false)
    }
    return result
  }

  const handleEditDispatcher = async (data: NewDispatcher): Promise<boolean> => {
    if (selectedDispatcher) {
      const result = await updateDispatcher(selectedDispatcher.id, data)
      if (result) {
        setIsEditModalOpen(false)
        setSelectedDispatcher(null)
      }
      return result
    }
    return false
  }

  const handleDeleteDispatcher = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого диспетчера?")) {
      await removeDispatcher(id)
    }
  }

  const handleChangeStatus = async (id: string, status: DispatcherStatus) => {
    await changeStatus(id, status)
  }

  const handleChangePassword = async (id: string, newPassword: string) => {
    try {
      await authService.changePassword(id, newPassword)
      alert("Пароль успешно изменён")
    } catch (error) {
      console.error("Ошибка при смене пароля:", error)
      alert("Не удалось изменить пароль")
    }
  }

  const handleViewShifts = async (dispatcher: Dispatcher) => {
    setSelectedDispatcher(dispatcher)
    setShiftsLoading(true)
    setIsShiftDialogOpen(true)

    try {
      const shiftsData = await getDispatcherShifts(dispatcher.id)
      setShifts(shiftsData)
    } catch (error) {
      console.error("Ошибка при загрузке смен:", error)
    } finally {
      setShiftsLoading(false)
    }
  }

  const convoysWithStrings = convoys.map((c) => ({
    ...c,
    number: String(c.number),
  }))

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Управление диспетчерами</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Список диспетчеров</h2>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Добавить диспетчера
            </button>
          </div>

          <DispatcherFiltersComponent
            filters={filters}
            convoys={convoysWithStrings}
            onFilterChange={updateFilters}
          />

          <DispatcherTable
            dispatchers={dispatchers}
            onEdit={(dispatcher) => {
              setSelectedDispatcher(dispatcher)
              setIsEditModalOpen(true)
            }}
            onDelete={handleDeleteDispatcher}
            onChangeStatus={handleChangeStatus}
            onChangePassword={handleChangePassword}
            onViewShifts={handleViewShifts}
            loading={loading}
          />
        </div>
      </div>

      <DispatcherForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDispatcher}
        convoys={convoysWithStrings}
        title="Добавление нового диспетчера"
      />

      {selectedDispatcher && (
        <DispatcherForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedDispatcher(null)
          }}
          onSubmit={handleEditDispatcher}
          dispatcher={selectedDispatcher}
          convoys={convoysWithStrings}
          title="Редактирование диспетчера"
        />
      )}

      <DispatcherShiftDialog
        isOpen={isShiftDialogOpen}
        onClose={() => {
          setIsShiftDialogOpen(false)
          setSelectedDispatcher(null)
          setShifts([])
        }}
        dispatcher={selectedDispatcher}
        shifts={shifts}
        loading={shiftsLoading}
      />
    </div>
  )
}
