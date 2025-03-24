"use client"

import type React from "react"

import { useState } from "react"
import type { User, UserFormData } from "../types"
import { toast } from "@/components/ui/use-toast"

export function useUsers(
  initialUsers: User[],
  updateConvoys: (userId: string, oldConvoyId: string | undefined, newConvoyId: string | undefined) => void,
) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUserRole, setSelectedUserRole] = useState<string | null>(null)
  const [newUserData, setNewUserData] = useState<UserFormData>({
    name: "",
    email: "",
    login: "",
    password: "",
    role: "",
    position: "",
    convoyId: "",
  })

  // Группировка пользователей по ролям
  const usersByRole = {
    fleetManager: users.filter((user) => user.role === "fleet-manager"),
    seniorDispatcher: users.filter((user) => user.role === "senior-dispatcher"),
    dispatcher: users.filter((user) => user.role === "dispatcher"),
    mechanic: users.filter((user) => user.role === "mechanic"),
    hr: users.filter((user) => user.role === "hr"),
    taksirovka: users.filter((user) => user.role === "taksirovka"),
  }

  // Обработчик изменения полей формы пользователя
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUserData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (name: string, value: string) => {
    setNewUserData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик добавления нового пользователя
  const handleAddUser = (convoys: any[]) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      position: newUserData.position,
      avatar: "",
    }

    // Если выбрана роль начальника колонны и указана колонна
    if (newUserData.role === "fleet-manager" && newUserData.convoyId && newUserData.convoyId !== "not-assigned") {
      const convoy = convoys.find((c) => c.id === newUserData.convoyId)
      if (convoy) {
        newUser.convoyId = newUserData.convoyId
        newUser.convoyNumber = convoy.number
        newUser.position = `Начальник колонны №${convoy.number}`

        // Обновляем автоколонну через callback
        updateConvoys(newUser.id, undefined, newUserData.convoyId)
      }
    }

    setUsers((prev) => [...prev, newUser])
    setNewUserData({ name: "", email: "", login: "", password: "", role: "", position: "", convoyId: "" })

    toast({
      title: "Пользователь добавлен",
      description: `Пользователь ${newUser.name} успешно добавлен`,
    })

    return true
  }

  // Обработчик редактирования пользователя
  const handleEditUser = (convoys: any[]) => {
    if (!selectedUser) return false

    const updatedUser = {
      ...selectedUser,
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      position: newUserData.position,
    }

    // Если изменилась роль с/на начальника колонны или изменилась колонна
    if (newUserData.role === "fleet-manager") {
      // Если выбрана новая колонна
      if (newUserData.convoyId && newUserData.convoyId !== "not-assigned") {
        const convoy = convoys.find((c) => c.id === newUserData.convoyId)
        if (convoy) {
          // Если пользователь уже был начальником другой колонны, освобождаем предыдущую
          if (selectedUser.convoyId && selectedUser.convoyId !== newUserData.convoyId) {
            // Обновляем автоколонну через callback
            updateConvoys(selectedUser.id, selectedUser.convoyId, newUserData.convoyId)
          } else if (!selectedUser.convoyId) {
            // Если пользователь не был начальником колонны, просто назначаем
            updateConvoys(selectedUser.id, undefined, newUserData.convoyId)
          }

          // Обновляем данные пользователя
          updatedUser.convoyId = newUserData.convoyId
          updatedUser.convoyNumber = convoy.number
          updatedUser.position = `Начальник колонны №${convoy.number}`
        }
      } else {
        // Если не выбрана колонна, но пользователь был начальником
        if (selectedUser.convoyId) {
          // Освобождаем колонну
          updateConvoys(selectedUser.id, selectedUser.convoyId, undefined)

          // Удаляем информацию о колонне у пользователя
          delete updatedUser.convoyId
          delete updatedUser.convoyNumber
        }
      }
    } else if (selectedUser.role === "fleet-manager" && newUserData.role !== "fleet-manager") {
      // Если пользователь был начальником колонны, а теперь нет
      if (selectedUser.convoyId) {
        // Освобождаем колонну
        updateConvoys(selectedUser.id, selectedUser.convoyId, undefined)

        // Удаляем информацию о колонне у пользователя
        delete updatedUser.convoyId
        delete updatedUser.convoyNumber
      }
    }

    setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? updatedUser : user)))

    toast({
      title: "Пользователь обновлен",
      description: `Данные пользователя ${updatedUser.name} успешно обновлены`,
    })

    return true
  }

  // Открытие диалога редактирования пользователя
  const openEditUserDialog = (user: User) => {
    setSelectedUser(user)
    setNewUserData({
      name: user.name,
      email: user.email,
      login: "",
      password: "",
      role: user.role,
      position: user.position || "",
      convoyId: user.convoyId || "",
    })
    return user
  }

  // Открытие диалога просмотра пользователей по роли
  const openViewUsersDialog = (role: string) => {
    setSelectedUserRole(role)
    return role
  }

  // Обновление пользователя при изменении автоколонны
  const updateUserConvoy = (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const updatedUser = { ...user }

          if (convoyId && convoyNumber) {
            updatedUser.convoyId = convoyId
            updatedUser.convoyNumber = convoyNumber
            updatedUser.position = `Начальник колонны №${convoyNumber}`
          } else {
            delete updatedUser.convoyId
            delete updatedUser.convoyNumber
            // Если была должность с номером колонны, убираем номер
            if (updatedUser.position?.includes("№")) {
              updatedUser.position = updatedUser.position.replace(/№\d+/, "")
            }
          }

          return updatedUser
        }
        return user
      }),
    )
  }

  return {
    users,
    setUsers,
    usersByRole,
    selectedUser,
    setSelectedUser,
    selectedUserRole,
    setSelectedUserRole,
    newUserData,
    setNewUserData,
    handleUserFormChange,
    handleSelectChange,
    handleAddUser,
    handleEditUser,
    openEditUserDialog,
    openViewUsersDialog,
    updateUserConvoy,
  }
}

