"use client"

import type React from "react"

import { useState } from "react"
import type { Convoy, ConvoyFormData } from "../types"
import { toast } from "@/components/ui/use-toast"

export function useConvoys(
  initialConvoys: Convoy[],
  depotId: string,
  updateUserConvoy: (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => void,
) {
  const [convoys, setConvoys] = useState<Convoy[]>(initialConvoys)
  const [selectedConvoy, setSelectedConvoy] = useState<Convoy | null>(null)
  const [newConvoyData, setNewConvoyData] = useState<ConvoyFormData>({
    number: "",
    chiefId: "",
    mechanicId: "",
  })

  // Обработчик изменения полей формы автоколонны
  const handleConvoyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewConvoyData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (name: string, value: string) => {
    setNewConvoyData((prev) => ({ ...prev, [name]: value === "not-assigned" ? "" : value }))
  }

  // Обработчик добавления новой автоколонны
  const handleAddConvoy = () => {
    const number = Number.parseInt(newConvoyData.number)
    if (isNaN(number)) {
      toast({
        title: "Ошибка",
        description: "Номер колонны должен быть числом",
        variant: "destructive",
      })
      return false
    }

    // Проверяем, нет ли уже колонны с таким номером
    if (convoys.some((c) => c.number === number)) {
      toast({
        title: "Ошибка",
        description: `Колонна №${number} уже существует`,
        variant: "destructive",
      })
      return false
    }

    const newConvoy: Convoy = {
      id: Date.now().toString(),
      number,
      busDepotId: depotId,
      chiefId: newConvoyData.chiefId || undefined,
      mechanicId: newConvoyData.mechanicId || undefined,
      busIds: [],
    }

    // Если назначен начальник колонны, обновляем его данные
    if (newConvoyData.chiefId) {
      // Если пользователь уже был начальником другой колонны, освобождаем предыдущую
      const existingConvoy = convoys.find((c) => c.chiefId === newConvoyData.chiefId)
      if (existingConvoy) {
        setConvoys((prev) => prev.map((c) => (c.id === existingConvoy.id ? { ...c, chiefId: undefined } : c)))
      }

      // Обновляем данные пользователя через callback
      updateUserConvoy(newConvoyData.chiefId, newConvoy.id, newConvoy.number)
    }

    setConvoys((prev) => [...prev, newConvoy])
    setNewConvoyData({ number: "", chiefId: "", mechanicId: "" })

    toast({
      title: "Автоколонна добавлена",
      description: `Автоколонна №${number} успешно добавлена`,
    })

    return true
  }

  // Обработчик редактирования автоколонны
  const handleEditConvoy = () => {
    if (!selectedConvoy) return false

    const number = Number.parseInt(newConvoyData.number)
    if (isNaN(number)) {
      toast({
        title: "Ошибка",
        description: "Номер колонны должен быть числом",
        variant: "destructive",
      })
      return false
    }

    // Проверяем, нет ли уже другой колонны с таким номером
    if (convoys.some((c) => c.number === number && c.id !== selectedConvoy.id)) {
      toast({
        title: "Ошибка",
        description: `Колонна №${number} уже существует`,
        variant: "destructive",
      })
      return false
    }

    const updatedConvoy = {
      ...selectedConvoy,
      number,
      chiefId: newConvoyData.chiefId || undefined,
      mechanicId: newConvoyData.mechanicId || undefined,
    }

    // Если изменился начальник колонны
    if (selectedConvoy.chiefId !== updatedConvoy.chiefId) {
      // Если был предыдущий начальник, обновляем его данные
      if (selectedConvoy.chiefId) {
        updateUserConvoy(selectedConvoy.chiefId, undefined, undefined)
      }

      // Если назначен новый начальник, обновляем его данные
      if (updatedConvoy.chiefId) {
        // Если пользователь уже был начальником другой колонны, освобождаем предыдущую
        const existingConvoy = convoys.find((c) => c.chiefId === updatedConvoy.chiefId && c.id !== selectedConvoy.id)
        if (existingConvoy) {
          setConvoys((prev) => prev.map((c) => (c.id === existingConvoy.id ? { ...c, chiefId: undefined } : c)))
        }

        // Обновляем данные пользователя через callback
        updateUserConvoy(updatedConvoy.chiefId, updatedConvoy.id, updatedConvoy.number)
      }
    } else if (selectedConvoy.number !== updatedConvoy.number && updatedConvoy.chiefId) {
      // Если изменился только номер колонны, обновляем данные начальника
      updateUserConvoy(updatedConvoy.chiefId, updatedConvoy.id, updatedConvoy.number)
    }

    setConvoys((prev) => prev.map((convoy) => (convoy.id === selectedConvoy.id ? updatedConvoy : convoy)))

    toast({
      title: "Автоколонна обновлена",
      description: `Данные автоколонны №${updatedConvoy.number} успешно обновлены`,
    })

    return true
  }

  // Обработчик удаления автоколонны
  const handleDeleteConvoy = () => {
    if (!selectedConvoy) return false

    // Если у колонны был начальник, обновляем его данные
    if (selectedConvoy.chiefId) {
      updateUserConvoy(selectedConvoy.chiefId, undefined, undefined)
    }

    setConvoys((prev) => prev.filter((convoy) => convoy.id !== selectedConvoy.id))

    toast({
      title: "Автоколонна удалена",
      description: `Автоколонна №${selectedConvoy.number} успешно удалена`,
    })

    return true
  }

  // Открытие диалога редактирования автоколонны
  const openEditConvoyDialog = (convoy: Convoy) => {
    setSelectedConvoy(convoy)
    setNewConvoyData({
      number: convoy.number.toString(),
      chiefId: convoy.chiefId || "",
      mechanicId: convoy.mechanicId || "",
    })
    return convoy
  }

  // Открытие диалога просмотра автоколонны
  const openViewConvoyDialog = (convoy: Convoy) => {
    setSelectedConvoy(convoy)
    return convoy
  }

  // Обновление автоколонн при изменении пользователя
  const updateConvoys = (userId: string, oldConvoyId: string | undefined, newConvoyId: string | undefined) => {
    if (oldConvoyId) {
      // Освобождаем старую колонну
      setConvoys((prev) => prev.map((c) => (c.id === oldConvoyId ? { ...c, chiefId: undefined } : c)))
    }

    if (newConvoyId) {
      // Назначаем новую колонну
      setConvoys((prev) => prev.map((c) => (c.id === newConvoyId ? { ...c, chiefId: userId } : c)))
    }
  }

  return {
    convoys,
    setConvoys,
    selectedConvoy,
    setSelectedConvoy,
    newConvoyData,
    setNewConvoyData,
    handleConvoyFormChange,
    handleSelectChange,
    handleAddConvoy,
    handleEditConvoy,
    handleDeleteConvoy,
    openEditConvoyDialog,
    openViewConvoyDialog,
    updateConvoys,
  }
}

