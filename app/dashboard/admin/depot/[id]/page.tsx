"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin } from "lucide-react";
import { busDepotService, authService, convoyService } from "@/app/api/apiService";
import { toast } from "@/components/ui/use-toast";

import type { BusDepot, User, Convoy } from "./types";
import { useUsers } from "./hooks/useUsers";
import { useConvoys } from "./hooks/useConvoys";

import UsersTab from "./components/tabs/UsersTab";
import ConvoysTab from "./components/tabs/ConvoysTab";
import AddUserDialog from "./components/dialogs/AddUserDialog";
import EditUserDialog from "./components/dialogs/EditUserDialog";
import ViewUsersDialog from "./components/dialogs/ViewUsersDialog";
import AddConvoyDialog from "./components/dialogs/AddConvoyDialog";
import EditConvoyDialog from "./components/dialogs/EditConvoyDialog";
import ViewConvoyDialog from "./components/dialogs/ViewConvoyDialog";
import { useMemo } from "react";
import { log } from "console";

export default function DepotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const depotId = params.id as string;

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  // const [enrichedUsers, setEnrichedUsers] = useState<User[]>([]);

  
  useEffect(() => {
    const checkUserRole = () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setAuthError("Вы не авторизованы. Пожалуйста, войдите в систему.");
        router.push("/login");
        return;
      }

      const userRole = localStorage.getItem("userRole");
      if (!userRole) {
        setAuthError("Роль пользователя не найдена. Пожалуйста, войдите снова.");
        router.push("/login");
        return;
      }

      const normalizedRole = userRole.toLowerCase();
      if (normalizedRole !== "admin") {
        setAuthError("У вас нет прав для управления автобусным парком.");
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
    };

    checkUserRole();
  }, [router]);
  

  const { data: depot, isLoading: depotLoading, error: depotError } = useQuery({
    queryKey: ["depot", depotId],
    queryFn: async () => {
      const response = await busDepotService.getById(depotId);
      if (!response.isSuccess || !response.value) {
        throw new Error("Не удалось загрузить данные парка: " + response.error);
      }
      return response.value;
    },
    enabled: !!depotId && isAdmin,
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ["users", depotId],
    queryFn: async () => {
      const response = await authService.getUsersByDepotId(depotId);
      if (!response.isSuccess || !response.value) {
        throw new Error("Не удалось загрузить пользователей: " + response.error);
      }
  
      return response.value.map((user) => ({
        ...user,
        role: user.role.charAt(0).toLowerCase() + user.role.slice(1),
      })) as User[];      
    },
    enabled: !!depotId && isAdmin,
  });
  
  

  const {
    convoys: managedConvoys,
    selectedConvoy,
    newConvoyData,
    handleConvoyFormChange,
    handleSelectChange: handleConvoySelectChange,
    handleAddConvoy,
    handleEditConvoy,
    handleDeleteConvoy,
    openEditConvoyDialog,
    openViewConvoyDialog,
    updateConvoys,
  } = useConvoys({ depotId, updateUserConvoy: (userId, convoyId) => {}, users: [] });

  const enrichedUsers = useMemo(() => {
    if (!users || !managedConvoys) return [];
  
    return users.map((user) => {
      const convoy = managedConvoys.find(
        (c) => c.chiefId === user.id || c.mechanicId === user.id || c.id === user.convoyId
      );
      return {
        ...user,
        convoyId: user.convoyId || convoy?.id || undefined,
        convoyNumber: convoy?.number || undefined,
      } as User;
    });
  }, [users, managedConvoys]);
  

  const {
    users: managedUsers,
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
  } = useUsers({
    initialUsers: enrichedUsers,
    updateUserConvoy: (userId, convoyId) => {
      if (convoyId) {
        updateConvoys(convoyId, userId, "fleetManager");
      }
    },
  });

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isViewUsersDialogOpen, setIsViewUsersDialogOpen] = useState(false);
  const [isAddConvoyDialogOpen, setIsAddConvoyDialogOpen] = useState(false);
  const [isEditConvoyDialogOpen, setIsEditConvoyDialogOpen] = useState(false);
  const [isViewConvoyDialogOpen, setIsViewConvoyDialogOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    setNewUserData((prev) => ({ ...prev, busDepotId: depotId }));
  }, [depotId, setNewUserData]);

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["users", depotId] }),
      queryClient.refetchQueries({ queryKey: ["users", depotId] }),
      queryClient.invalidateQueries({ queryKey: ["convoys", depotId] }),
      queryClient.refetchQueries({ queryKey: ["convoys", depotId] }),
    ]);
  };

  const handleOpenAddUserDialog = () => {
    setIsAddUserDialogOpen(true);
  };

  const handleOpenAddUserWithRole = (role: "fleetManager" | "mechanic" | "admin" | "mechanicOnDuty" | "dispatcher" | "seniorDispatcher" | "hr" | "taskInspector") => {
    setNewUserData((prev) => ({ ...prev, role }));
    setIsAddUserDialogOpen(true);
  };

  const handleSubmitAddUser = async () => {
    const success = await handleAddUser(managedConvoys);
    if (success) {
      setIsAddUserDialogOpen(false);
      await refreshData();
      toast({ title: "Успех", description: "Пользователь успешно добавлен." });
    }
  };

  const handleOpenEditUserDialog = (user: User) => {
    openEditUserDialog(user);
    setIsEditUserDialogOpen(true);
  };

  const handleSubmitEditUser = async () => {
    const success = await handleEditUser(managedConvoys);
    if (success) {
      setIsEditUserDialogOpen(false);
      await refreshData();
      toast({ title: "Успех", description: "Пользователь успешно обновлён." });
    }
  };

  const handleOpenViewUsersDialog = (role: string) => {
    openViewUsersDialog(role);
    setIsViewUsersDialogOpen(true);
  };

  const handleOpenAddConvoyDialog = () => {
    setIsAddConvoyDialogOpen(true);
  };

  const handleSubmitAddConvoy = async () => {
    const success = await handleAddConvoy();
    if (success) {
      setIsAddConvoyDialogOpen(false);
      await refreshData();
      toast({ title: "Успех", description: "Автоколонна успешно добавлена." });
    }
  };

  const handleOpenEditConvoyDialog = (convoy: Convoy) => {
    console.log("handleOpenEditConvoyDialog вызван для:", convoy);
    openEditConvoyDialog(convoy);
    setIsEditConvoyDialogOpen(true);
  };

  const handleSubmitEditConvoy = async () => {
    const success = await handleEditConvoy();
    if (success) {
      setIsEditConvoyDialogOpen(false);
      await refreshData();
      toast({ title: "Успех", description: "Автоколонна успешно обновлена." });
    }
  };

  const handleOpenViewConvoyDialog = (convoy: Convoy) => {
    console.log("handleOpenViewConvoyDialog вызван для:", convoy);
    openViewConvoyDialog(convoy);
    setIsViewConvoyDialogOpen(true);
  };

  const handleDeleteUserAndClose = async (userId: string) => {
    setSelectedUser({ id: userId } as User);
    const success = await handleDeleteUser();
    if (success) {
      setIsViewUsersDialogOpen(false);
      await refreshData();
      toast({ title: "Успех", description: "Пользователь успешно удален." });
    }
  };

  const handleDeleteConvoyAndClose = async () => {
    const success = await handleDeleteConvoy();
    if (success) {
      setIsViewConvoyDialogOpen(false);
      await refreshData();
      toast({ title: "Успех", description: "Автоколонна успешно удалена." });
    }
  };

  const isLoading = depotLoading || usersLoading;
  const error = authError || depotError?.message || usersError?.message;

  if (!isAdmin) {
    return <div className="container mx-auto p-6 text-red-500">{authError || "Проверка прав доступа..."}</div>;
  }

  if (isLoading) {
    return <div className="container mx-auto p-6">Загрузка...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          {depot ? (
            <div>
              <h1 className="text-3xl font-bold text-sky-700">{depot.name}</h1>
              <p className="text-gray-500 mt-1 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {depot.city}, {depot.address}
              </p>
            </div>
          ) : (
            <div className="text-gray-500">Автобусный парк не найден.</div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="convoys">Автоколонны</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UsersTab
            usersByRole={usersByRole}
            onEditUser={handleOpenEditUserDialog}
            onViewUsers={handleOpenViewUsersDialog}
            onAddUser={handleOpenAddUserDialog}
            onDeleteUser={handleDeleteUserAndClose} // Добавляем обработчик удаления
          />
        </TabsContent>

        <TabsContent value="convoys" className="space-y-6">
          <ConvoysTab
            convoys={managedConvoys}
            users={managedUsers}
            onEditConvoy={handleOpenEditConvoyDialog}
            onViewConvoy={handleOpenViewConvoyDialog}
            onAddConvoy={handleOpenAddConvoyDialog}
          />
        </TabsContent>
      </Tabs>

      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        formData={newUserData}
        convoys={managedConvoys}
        onFormChange={handleUserFormChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSubmitAddUser}
      />

      <EditUserDialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
        formData={newUserData}
        convoys={managedConvoys}
        onFormChange={handleUserFormChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSubmitEditUser}
      />

      <ViewUsersDialog
        open={isViewUsersDialogOpen}
        onOpenChange={setIsViewUsersDialogOpen}
        role={selectedUserRole}
        usersByRole={usersByRole}
        onEdit={handleOpenEditUserDialog}
        onAddUser={handleOpenAddUserWithRole}
        onDelete={handleDeleteUserAndClose}
      />

      <AddConvoyDialog
        open={isAddConvoyDialogOpen}
        onOpenChange={setIsAddConvoyDialogOpen}
        formData={newConvoyData}
        users={managedUsers}
        onFormChange={handleConvoyFormChange}
        onSelectChange={handleConvoySelectChange}
        onSubmit={handleSubmitAddConvoy}
      />

      <EditConvoyDialog
        open={isEditConvoyDialogOpen}
        onOpenChange={setIsEditConvoyDialogOpen}
        formData={newConvoyData}
        users={managedUsers}
        onFormChange={handleConvoyFormChange}
        onSelectChange={handleConvoySelectChange}
        onSubmit={handleSubmitEditConvoy}
      />

      <ViewConvoyDialog
        open={isViewConvoyDialogOpen}
        onOpenChange={setIsViewConvoyDialogOpen}
        convoy={selectedConvoy}
        users={managedUsers}
        onEdit={handleOpenEditConvoyDialog}
        onDelete={handleDeleteConvoyAndClose}
      />
    </div>
  );
}