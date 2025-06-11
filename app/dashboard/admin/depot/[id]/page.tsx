"use client"

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin } from "lucide-react";
import { busDepotService } from "@/service/busDepotService";
import { authService } from "@/service/authService";
import { toast } from "@/components/ui/use-toast";

import type { BusDepot, User, Convoy } from "./types";
import type { UserRole } from "./types";
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

export default function DepotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const depotId = params.id as string;

  const isAdminCached = useMemo(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    return token && role?.toLowerCase() === "admin";
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const isAdminRole = token && userRole?.toLowerCase() === "admin";

    if (!isAdminRole) {
      setAuthError("У вас нет прав для управления автобусным парком.");
      router.push("/dashboard");
    } else {
      setIsAdmin(true);
    }
  }
}, [router]);

  const { data: depot, isLoading: depotLoading, error: depotError } = useQuery({
    queryKey: ["depot", depotId],
    queryFn: async () => {
      const response = await busDepotService.getById(depotId);
      if (!response.isSuccess || !response.value) throw new Error("Не удалось загрузить данные парка: " + response.error);
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
      const response = await authService.getByDepotId(depotId);
      if (!response.isSuccess || !response.value) throw new Error("Не удалось загрузить пользователей: " + response.error);
      return response.value.map((user: User) => ({
        ...user,
        role:
          user.role === "CTS" ? "CTS" :
          user.role === "MCC" ? "MCC" :
          (user.role.charAt(0).toLowerCase() + user.role.slice(1))
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
  } = useConvoys({ depotId, updateUserConvoy: () => {}, users: [] });

  const enrichedUsers = useMemo(() => {
    if (!users || !managedConvoys) return [];
    return users.map(user => {
      const convoy = managedConvoys.find(c => c.chiefId === user.id || c.mechanicId === user.id || c.id === user.convoyId);
      return { ...user, convoyId: user.convoyId || convoy?.id, convoyNumber: convoy?.number } as User;
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
      if (convoyId) updateConvoys(convoyId, userId, "fleetManager");
    },
  });

  const [dialogs, setDialogs] = useState({
    addUser: false,
    editUser: false,
    viewUsers: false,
    addConvoy: false,
    editConvoy: false,
    viewConvoy: false,
  });

  const toggleDialog = (key: keyof typeof dialogs, open: boolean) => {
    setDialogs(prev => ({ ...prev, [key]: open }));
  };

  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (depotId) {
      setNewUserData(prev => ({ ...prev, busDepotId: depotId }));
    }
  }, [depotId, setNewUserData]);

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["users", depotId] }),
      queryClient.invalidateQueries({ queryKey: ["convoys", depotId] }),
    ]);
  };

  const openAddUser = (role?: UserRole) => {
    if (role) setNewUserData(prev => ({ ...prev, role }));
    toggleDialog("addUser", true);
  };

  const isLoading = depotLoading || usersLoading;
  const error = authError || depotError?.message || usersError?.message;

  if (!isAdmin) return <div className="container mx-auto p-6 text-red-500">{authError || "Проверка прав доступа..."}</div>;
  if (isLoading) return <div className="container mx-auto p-6">Загрузка...</div>;
  if (error) return <div className="container mx-auto p-6 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-sky-700">{depot?.name}</h1>
          <p className="text-gray-500 mt-1 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {depot?.city}, {depot?.address}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="convoys">Автоколонны</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab
            usersByRole={usersByRole}
            onEditUser={user => { openEditUserDialog(user); toggleDialog("editUser", true); }}
            onViewUsers={role => { openViewUsersDialog(role); toggleDialog("viewUsers", true); }}
            onAddUser={() => openAddUser()}
            onDeleteUser={async userId => {
              setSelectedUser({ id: userId } as User);
              const success = await handleDeleteUser();
              if (success) {
                toggleDialog("viewUsers", false);
                await refreshData();
                toast({ title: "Успех", description: "Пользователь успешно удалён." });
              }
            }}
          />
        </TabsContent>

        <TabsContent value="convoys">
          <ConvoysTab
            convoys={managedConvoys}
            users={managedUsers}
            onEditConvoy={convoy => { openEditConvoyDialog(convoy); toggleDialog("editConvoy", true); }}
            onViewConvoy={convoy => { openViewConvoyDialog(convoy); toggleDialog("viewConvoy", true); }}
            onAddConvoy={() => toggleDialog("addConvoy", true)}
          />
        </TabsContent>
      </Tabs>

      <AddUserDialog open={dialogs.addUser} onOpenChange={v => toggleDialog("addUser", v)}
        formData={newUserData} convoys={managedConvoys} onFormChange={handleUserFormChange}
        onSelectChange={handleSelectChange} onSubmit={async () => {
          const success = await handleAddUser(managedConvoys);
          if (success) {
            toggleDialog("addUser", false);
            await refreshData();
            toast({ title: "Успех", description: "Пользователь добавлен." });
          }
        }}
      />

      <EditUserDialog open={dialogs.editUser} onOpenChange={v => toggleDialog("editUser", v)}
        formData={newUserData} convoys={managedConvoys} onFormChange={handleUserFormChange}
        onSelectChange={handleSelectChange} onSubmit={async () => {
          const success = await handleEditUser(managedConvoys);
          if (success) {
            toggleDialog("editUser", false);
            await refreshData();
            toast({ title: "Успех", description: "Пользователь обновлён." });
          }
        }}
      />

      <ViewUsersDialog open={dialogs.viewUsers} onOpenChange={v => toggleDialog("viewUsers", v)}
        role={selectedUserRole} usersByRole={usersByRole} onEdit={user => { openEditUserDialog(user); toggleDialog("editUser", true); }}
        onAddUser={role => openAddUser(role as UserRole)} onDelete={async userId => {
          setSelectedUser({ id: userId } as User);
          const success = await handleDeleteUser();
          if (success) {
            toggleDialog("viewUsers", false);
            await refreshData();
            toast({ title: "Успех", description: "Пользователь удалён." });
          }
        }}
      />

      <AddConvoyDialog open={dialogs.addConvoy} onOpenChange={v => toggleDialog("addConvoy", v)}
        formData={newConvoyData} users={managedUsers} onFormChange={handleConvoyFormChange}
        onSelectChange={handleConvoySelectChange} onSubmit={async () => {
          const success = await handleAddConvoy();
          if (success) {
            toggleDialog("addConvoy", false);
            await refreshData();
            toast({ title: "Успех", description: "Автоколонна добавлена." });
          }
        }}
      />

      <EditConvoyDialog open={dialogs.editConvoy} onOpenChange={v => toggleDialog("editConvoy", v)}
        formData={newConvoyData} users={managedUsers} onFormChange={handleConvoyFormChange}
        onSelectChange={handleConvoySelectChange} onSubmit={async () => {
          const success = await handleEditConvoy();
          if (success) {
            toggleDialog("editConvoy", false);
            await refreshData();
            toast({ title: "Успех", description: "Автоколонна обновлена." });
          }
        }}
      />

      <ViewConvoyDialog open={dialogs.viewConvoy} onOpenChange={v => toggleDialog("viewConvoy", v)}
        convoy={selectedConvoy} users={managedUsers}
        onEdit={convoy => { openEditConvoyDialog(convoy); toggleDialog("editConvoy", true); }}
        onDelete={async () => {
          const success = await handleDeleteConvoy();
          if (success) {
            toggleDialog("viewConvoy", false);
            await refreshData();
            toast({ title: "Успех", description: "Автоколонна удалена." });
          }
        }}
      />
    </div>
  );
}
