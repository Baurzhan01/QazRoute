import { useState, useMemo, useEffect } from "react";
import type { User, Convoy, UserFormData } from "../types";
import type { UpdateUserRequest, RegisterRequest } from "@/types/auth.types";
import type { UserRole } from "../types";
import { toast } from "@/components/ui/use-toast";
import { authService } from "@/service/authService";

interface UseUsersProps {
  initialUsers: User[];
  updateUserConvoy: (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => void;
}

export function useUsers({ initialUsers, updateUserConvoy }: UseUsersProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
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
  });

  // Sync users when initialUsers change
  useEffect(() => {
    if (JSON.stringify(users) !== JSON.stringify(initialUsers)) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  // Group users by roles
  const usersByRole = useMemo(() => {
    const result = {} as Record<UserRole, User[]>;
    const roles: UserRole[] = [
      "fleetManager",
      "mechanic",
      "admin",
      "mechanicOnDuty",
      "dispatcher",
      "seniorDispatcher",
      "hr",
      "taskInspector",
    ];

    roles.forEach(role => result[role] = []);

    users.forEach(user => {
      const role = (user.role.charAt(0).toLowerCase() + user.role.slice(1)) as UserRole;
      result[role].push(user);
    });

    return result;
  }, [users]);

  // Handlers
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof UserFormData, value: string | undefined) => {
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (convoys: Convoy[]) => {
    if (!newUserData.fullName || !newUserData.email || !newUserData.login || !newUserData.password) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return false;
    }

    const rolePascal = (newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1)) as User["role"];

    const userData: RegisterRequest = {
      fullName: newUserData.fullName,
      email: newUserData.email,
      login: newUserData.login,
      password: newUserData.password,
      role: rolePascal,
      busDepotId: newUserData.busDepotId,
      convoyId: newUserData.convoyId === "not-assigned" ? undefined : newUserData.convoyId,
    };

    const response = await authService.register(userData);

    if (!response.isSuccess) {
      toast({ title: "Ошибка", description: "Не удалось добавить пользователя: " + response.error, variant: "destructive" });
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
      convoyNumber: undefined,
    });

    return true;
  };

  const handleEditUser = async (convoys: Convoy[]) => {
    if (!selectedUser || !newUserData.fullName || !newUserData.role) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return false;
    }

    const rolePascal = (newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1)) as User["role"];
    const convoyIdToSend = newUserData.convoyId === "not-assigned" ? undefined : newUserData.convoyId;
    const convoyNumber = newUserData.convoyNumber;

    let convoyNumberString: string | undefined = undefined;
    if (typeof convoyNumber === "number" && !isNaN(convoyNumber)) {
      convoyNumberString = String(convoyNumber).slice(0, 2);
      console.log("Convoy Number (first two digits):", convoyNumberString);
    }

    const userData: UpdateUserRequest = {
      fullName: newUserData.fullName,
      email: selectedUser.email,
      role: rolePascal,
      busDepotId: selectedUser.busDepotId || "",
      convoyId: convoyIdToSend,
      convoyNumber: convoyNumber,
    };

    const response = await authService.updateUser(selectedUser.id, userData);

    if (!response.isSuccess || !response.value) {
      toast({ title: "Ошибка", description: "Не удалось обновить пользователя: " + response.error, variant: "destructive" });
      return false;
    }

    const updatedRole = (response.value.role?.charAt(0).toLowerCase() + response.value.role.slice(1)) as User["role"];
    const convoy = convoys.find(c => c.id === response.value?.convoyId);

    const updatedUser: User = {
      ...selectedUser,
      ...response.value,
      role: updatedRole,
      convoyNumber: convoy?.number,
    };

    setUsers(prev => prev.map(u => (u.id === selectedUser.id ? updatedUser : u)));
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
      convoyNumber: undefined,
    });

    return true;
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return false;

    const response = await authService.deleteUser(selectedUser.id);

    if (response.isSuccess) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setSelectedUser(null);
      return true;
    }

    toast({ title: "Ошибка", description: "Не удалось удалить пользователя: " + response.error, variant: "destructive" });
    return false;
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
    setSelectedUserRole(role as UserRole);
  };

  const handleUserConvoyUpdate = (userId: string, convoyId: string | undefined, convoyNumber: number | undefined) => {
    setUsers(prev =>
      prev.map(user => (user.id === userId ? { ...user, convoyId } : user))
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
