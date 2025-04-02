import { useState, useMemo, useEffect } from "react";
import type { User, Convoy, UserFormData } from "../types";
import type { UpdateUserRequest, RegisterRequest } from "@/app/api/types";
import { toast } from "@/components/ui/use-toast";
import { authService } from "@/app/api/apiService";

interface UseUsersProps {
  initialUsers: User[];
  updateUserConvoy: (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => void;
}

export function useUsers({ initialUsers, updateUserConvoy }: UseUsersProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<User["role"] | null>(null);
  const [newUserData, setNewUserData] = useState<UserFormData>({
    fullName: "",
    email: "",
    login: "",
    password: "",
    role: "fleetManager",
    position: "",
    busDepotId: "",
    convoyId: undefined,
  });
  
  // Синхронизация users с initialUsers только при реальном изменении
  useEffect(() => {
    if (JSON.stringify(users) !== JSON.stringify(initialUsers)) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  // Группировка пользователей по ролям
  const usersByRole = useMemo(() => {
    const result = users.reduce<Record<User["role"], User[]>>(
      (acc, user) => {
        const normalizedRole = (user.role.charAt(0).toLowerCase() + user.role.slice(1)) as User["role"];
        if (!acc[normalizedRole]) {
          acc[normalizedRole] = [];
        }
        acc[normalizedRole].push(user);
        return acc;
      },
      {
        fleetManager: [],
        mechanic: [],
        admin: [],
        mechanicOnDuty: [],
        dispatcher: [],
        seniorDispatcher: [],
        hr: [],
        taskInspector: [],
      }
    );
    return result;
  }, [users]);

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (convoys: Convoy[]) => {
    console.log("handleAddUser: данные перед проверкой:", newUserData);
    if (!newUserData.fullName || !newUserData.email || !newUserData.login || !newUserData.password || !newUserData.role) {
      console.error("handleAddUser: не заполнены обязательные поля:", newUserData);
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return false;
    }

    // Преобразуем роль в PascalCase для отправки на сервер
    const roleInPascalCase = (newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1)) as User["role"];

    const userData: RegisterRequest = {
      fullName: newUserData.fullName,
      email: newUserData.email,
      login: newUserData.login,
      password: newUserData.password,
      role: roleInPascalCase,
      busDepotId: newUserData.busDepotId,
      convoyId: newUserData.convoyId === "not-assigned" ? undefined : newUserData.convoyId,
    };

    console.log("handleAddUser: отправляемые данные на сервер:", userData);
    const response = await authService.register(userData);
    console.log("handleAddUser: ответ от сервера:", response);

    if (!response.isSuccess) {
      console.error("handleAddUser: ошибка сервера:", response.error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить пользователя: " + response.error,
        variant: "destructive",
      });
      return false;
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
    });

    return true;
  };

  const handleEditUser = async (convoys: Convoy[]) => {
    console.log("handleEditUser: данные перед проверкой:", newUserData);
    if (!selectedUser || !newUserData.fullName || !newUserData.role) {
      console.error("handleEditUser: не заполнены обязательные поля:", newUserData);
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return false;
    }

   // Преобразуем роль в PascalCase для отправки на сервер
  const roleInPascalCase = (newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1)) as User["role"];

  const userData: UpdateUserRequest = {
    fullName: newUserData.fullName,
    email: selectedUser.email,
    role: roleInPascalCase,
    busDepotId: selectedUser.busDepotId || "",
    convoyId: newUserData.convoyId === "not-assigned" ? undefined : newUserData.convoyId,
    convoyNumber: newUserData.convoyNumber,
  };

  console.log("handleEditUser: отправляемые данные на сервер:", userData);
  const response = await authService.updateUser(selectedUser.id, userData);
  console.log("handleEditUser: ответ от сервера:", response);

  if (!response.isSuccess || !response.value) {
    console.error("handleEditUser: ошибка сервера:", response.error);
    toast({
      title: "Ошибка",
      description: "Не удалось обновить пользователя: " + response.error,
      variant: "destructive",
    });
    return false;
  }

   // Обновляем пользователя, проверяя наличие role в ответе
  const updatedRole = response.value.role
    ? (response.value.role.charAt(0).toLowerCase() + response.value.role.slice(1)) as User["role"]
    : selectedUser.role;

  // Находим convoyNumber на основе convoyId
  const convoy = convoys.find(c => c.id === response.value?.convoyId);
  const updatedUser: User = {
    ...selectedUser,
    ...response.value,
    role: updatedRole,
    convoyNumber: convoy ? convoy.number : undefined, // Добавляем convoyNumber
  };
  setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? updatedUser : user)));
  setSelectedUser(null);
  setNewUserData({
    fullName: "",
    email: "",
    login: "",
    password: "",
    role: "fleetManager",
    position: "",
    busDepotId: newUserData.busDepotId,
    convoyId: undefined,
  });
  return true;
};

  const handleDeleteUser = async () => {
    if (!selectedUser) return false;

    const response = await authService.deleteUser(selectedUser.id);
    if (response.isSuccess) {
      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
      setSelectedUser(null);
      return true;
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя: " + response.error,
        variant: "destructive",
      });
      return false;
    }
  };

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setNewUserData({
      fullName: user.fullName,
      email: user.email,
      login: "",
      password: "",
      role: user.role,
      position: user.position || "",
      busDepotId: user.busDepotId || "",
      convoyId: user.convoyId,
      convoyNumber: user.convoyNumber,
    });
  };

  const openViewUsersDialog = (role: string) => {
    setSelectedUserRole(role as User["role"] | null);
  };

  const handleUserConvoyUpdate = (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => {
    console.log("handleUserConvoyUpdate: обновление convoyId для пользователя:", { userId, convoyId, convoyNumber });
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, convoyId } : user))
    );
    updateUserConvoy(userId, convoyId, convoyNumber);
  };

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
  };
}