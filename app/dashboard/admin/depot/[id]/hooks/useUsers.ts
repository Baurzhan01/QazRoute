import { useState, useMemo, useEffect } from "react"
import type { User, Convoy, UserFormData } from "../types"
import type { UpdateUserRequest, RegisterRequest } from "@/types/auth.types"
import type { UserRole } from "../types"
import { toast } from "@/components/ui/use-toast"
import { authService } from "@/service/authService"
import { normalizeRole } from "../utils/roleUtils" // если вынес в утилиту


interface UseUsersProps {
  initialUsers: User[]
  updateUserConvoy: (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => void
}

export function useUsers({ initialUsers, updateUserConvoy }: UseUsersProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null)
  const [newUserData, setNewUserData] = useState<UserFormData>({
    fullName: "",
    email: "",
    login: "",
    password: "",
    role: "fleetManager",
    position: "",
    busDepotId: "",
    convoyId: undefined,
    convoyNumber: undefined,
  })
  

  useEffect(() => {
    if (JSON.stringify(users) !== JSON.stringify(initialUsers)) {
      setUsers(initialUsers.map(u => ({ ...u, role: normalizeRole(u.role) })))
    }
  }, [initialUsers])

  const usersByRole = useMemo(() => {
    const result = {} as Record<UserRole, User[]>
    const roles: UserRole[] = [
      "fleetManager",
      "mechanic",
      "admin",
      "mechanicOnDuty",
      "dispatcher",
      "seniorDispatcher",
      "hr",
      "CTS",
      "MCC",
      "taskInspector",
      "Guide",
      "LRT",
    ]
    roles.forEach(role => (result[role] = []))
    users.forEach(user => {
      const role = normalizeRole(user.role)
      if (result[role]) result[role].push(user)
    })
    return result
  }, [users])

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUserData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof UserFormData, value: string | undefined) => {
    setNewUserData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddUser = async (convoys: Convoy[]) => {
    if (!newUserData.fullName || !newUserData.email || !newUserData.login || !newUserData.password) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" })
      return false
    }

    const rolePascal = (newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1)) as User["role"]

    const userData: RegisterRequest = {
      fullName: newUserData.fullName,
      email: newUserData.email,
      login: newUserData.login,
      password: newUserData.password,
      role: rolePascal,
      busDepotId: newUserData.busDepotId,
      convoyId: newUserData.convoyId === "not-assigned" ? undefined : newUserData.convoyId,
    }

    const response = await authService.register(userData)

    if (!response.isSuccess) {
      toast({ title: "Ошибка", description: "Не удалось добавить пользователя: " + response.error, variant: "destructive" })
      return false
    }

    setNewUserData({
      fullName: "",
      email: "",
      login: "",
      password: "",
      role: "fleetManager",
      position: "",
      busDepotId: newUserData.busDepotId,
      convoyId: undefined,
      convoyNumber: undefined,
    })

    return true
  }

  const handleEditUser = async (convoys: Convoy[]) => {
    if (!selectedUser || !newUserData.fullName || !newUserData.role) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" })
      return false
    }

    const rolePascal = (newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1)) as User["role"]
    const convoyIdToSend = newUserData.convoyId === "not-assigned" ? undefined : newUserData.convoyId

    const userData: UpdateUserRequest = {
      fullName: newUserData.fullName,
      role: rolePascal,
      busDepotId: selectedUser.busDepotId || "",
      convoyId: convoyIdToSend,
      convoyNumber: newUserData.convoyNumber,
    }

    const response = await authService.updateUser(selectedUser.id, userData)

    if (!response.isSuccess || !response.value) {
      toast({ title: "Ошибка", description: "Не удалось обновить пользователя: " + response.error, variant: "destructive" })
      return false
    }

    const updatedRole = normalizeRole(response.value.role)
    const convoy = convoys.find(c => c.id === response.value?.convoyId)

    const updatedUser: User = {
      ...selectedUser,
      ...response.value,
      role: updatedRole,
      convoyNumber: convoy?.number,
    }

    setUsers(prev => prev.map(u => (u.id === selectedUser.id ? updatedUser : u)))
    setSelectedUser(null)

    setNewUserData({
      fullName: "",
      email: "",
      login: "",
      password: "",
      role: "fleetManager",
      position: "",
      busDepotId: newUserData.busDepotId,
      convoyId: undefined,
      convoyNumber: undefined,
    })

    return true
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return false

    const response = await authService.deleteUser(selectedUser.id)

    if (response.isSuccess) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      setSelectedUser(null)
      return true
    }

    toast({ title: "Ошибка", description: "Не удалось удалить пользователя: " + response.error, variant: "destructive" })
    return false
  }

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user)
    setNewUserData({
      fullName: user.fullName,
      email: user.email,
      login: "",
      password: "",
      role: normalizeRole(user.role),
      position: user.position || "",
      busDepotId: user.busDepotId || "",
      convoyId: user.convoyId,
      convoyNumber: user.convoyNumber,
    })
  }

  const openViewUsersDialog = (role: string) => {
    setSelectedUserRole(normalizeRole(role))
  }

  const handleUserConvoyUpdate = (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => {
    setUsers(prev => prev.map(user => (user.id === userId ? { ...user, convoyId, convoyNumber } : user)))
    updateUserConvoy(userId, convoyId, convoyNumber)
  }

  return {
    users,
    usersByRole,
    selectedUser,
    selectedUserRole,
    newUserData,
    setNewUserData,
    setSelectedUser,
    handleUserFormChange,
    handleSelectChange,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    openEditUserDialog,
    openViewUsersDialog,
    handleUserConvoyUpdate,
  }
}
