"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin } from "lucide-react"

// Импорт типов
import type { BusDepot } from "./types"

// Импорт хуков
import { useUsers } from "./hooks/useUsers"
import { useConvoys } from "./hooks/useConvoys"

// Импорт компонентов вкладок
import UsersTab from "./components/tabs/UsersTab"
import ConvoysTab from "./components/tabs/ConvoysTab"

// Импорт диалоговых окон
import AddUserDialog from "./components/dialogs/AddUserDialog"
import EditUserDialog from "./components/dialogs/EditUserDialog"
import ViewUsersDialog from "./components/dialogs/ViewUsersDialog"
import AddConvoyDialog from "./components/dialogs/AddConvoyDialog"
import EditConvoyDialog from "./components/dialogs/EditConvoyDialog"
import ViewConvoyDialog from "./components/dialogs/ViewConvoyDialog"

export default function DepotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const depotId = params.id as string

  // Состояние для данных автобусного парка
  const [depot, setDepot] = useState<BusDepot>({
    id: depotId,
    name: "Центральный автобусный парк",
    city: "Москва",
    address: "ул. Автобусная, 10",
    logo: "",
  })

  // Состояние для модальных окон
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [isViewUsersDialogOpen, setIsViewUsersDialogOpen] = useState(false)
  const [isAddConvoyDialogOpen, setIsAddConvoyDialogOpen] = useState(false)
  const [isEditConvoyDialogOpen, setIsEditConvoyDialogOpen] = useState(false)
  const [isViewConvoyDialogOpen, setIsViewConvoyDialogOpen] = useState(false)

  // Состояние для активной вкладки
  const [activeTab, setActiveTab] = useState("users")

  // Инициализация начальных данных
  const initialUsers = [
    {
      id: "1",
      name: "Иванов Иван Иванович",
      email: "ivanov@example.com",
      role: "fleet-manager",
      position: "Начальник колонны №1",
      avatar: "",
      convoyId: "1",
      convoyNumber: 1,
    },
    {
      id: "2",
      name: "Петров Петр Петрович",
      email: "petrov@example.com",
      role: "senior-dispatcher",
      position: "Старший диспетчер",
      avatar: "",
    },
    {
      id: "3",
      name: "Сидоров Сидор Сидорович",
      email: "sidorov@example.com",
      role: "dispatcher",
      position: "Диспетчер",
      avatar: "",
    },
    {
      id: "4",
      name: "Смирнов Алексей Иванович",
      email: "smirnov@example.com",
      role: "mechanic",
      position: "Механик",
      avatar: "",
    },
    {
      id: "5",
      name: "Козлова Анна Сергеевна",
      email: "kozlova@example.com",
      role: "hr",
      position: "Специалист отдела кадров",
      avatar: "",
    },
    {
      id: "6",
      name: "Морозов Дмитрий Александрович",
      email: "morozov@example.com",
      role: "taksirovka",
      position: "Специалист отдела таксировки",
      avatar: "",
    },
  ]

  const initialConvoys = [
    {
      id: "1",
      number: 1,
      busDepotId: depotId,
      chiefId: "1",
      mechanicId: "4",
      busIds: ["bus1", "bus2", "bus3"],
    },
    {
      id: "2",
      number: 2,
      busDepotId: depotId,
      chiefId: undefined,
      mechanicId: undefined,
      busIds: ["bus4", "bus5"],
    },
    {
      id: "3",
      number: 3,
      busDepotId: depotId,
      chiefId: undefined,
      mechanicId: undefined,
      busIds: ["bus6", "bus7", "bus8", "bus9"],
    },
  ]

    // Сначала инициализируем useConvoys, чтобы получить updateConvoys
    const {
      convoys,
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
    } = useConvoys(initialConvoys, depotId)
  
    // А уже потом вызываем useUsers, передавая updateConvoys
    const {
      users,
      usersByRole,
      selectedUser,
      selectedUserRole,
      newUserData,
      handleUserFormChange,
      handleSelectChange: handleUserSelectChange,
      handleAddUser,
      handleEditUser,
      openEditUserDialog,
      openViewUsersDialog,
      updateUserConvoy,
    } = useUsers(initialUsers, updateConvoys)
  

  // Обработчики для диалоговых окон
  const handleOpenAddUserDialog = () => {
    setIsAddUserDialogOpen(true)
  }

  const handleOpenAddUserWithRole = (role: string) => {
    newUserData.role = role
    setIsAddUserDialogOpen(true)
  }

  const handleSubmitAddUser = () => {
    if (handleAddUser(convoys)) {
      setIsAddUserDialogOpen(false)
    }
  }

  const handleOpenEditUserDialog = (user) => {
    openEditUserDialog(user)
    setIsEditUserDialogOpen(true)
  }

  const handleSubmitEditUser = () => {
    if (handleEditUser(convoys)) {
      setIsEditUserDialogOpen(false)
    }
  }

  const handleOpenViewUsersDialog = (role) => {
    openViewUsersDialog(role)
    setIsViewUsersDialogOpen(true)
  }

  const handleOpenAddConvoyDialog = () => {
    setIsAddConvoyDialogOpen(true)
  }

  const handleSubmitAddConvoy = () => {
    if (handleAddConvoy()) {
      setIsAddConvoyDialogOpen(false)
    }
  }

  const handleOpenEditConvoyDialog = (convoy) => {
    openEditConvoyDialog(convoy)
    setIsEditConvoyDialogOpen(true)
  }

  const handleSubmitEditConvoy = () => {
    if (handleEditConvoy()) {
      setIsEditConvoyDialogOpen(false)
    }
  }

  const handleOpenViewConvoyDialog = (convoy) => {
    openViewConvoyDialog(convoy)
    setIsViewConvoyDialogOpen(true)
  }

  const handleDeleteConvoyAndClose = () => {
    if (handleDeleteConvoy()) {
      setIsViewConvoyDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-sky-700">{depot.name}</h1>
          <p className="text-gray-500 mt-1 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {depot.city}, {depot.address}
          </p>
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
          />
        </TabsContent>

        <TabsContent value="convoys" className="space-y-6">
          <ConvoysTab
            convoys={convoys}
            users={users}
            onEditConvoy={handleOpenEditConvoyDialog}
            onViewConvoy={handleOpenViewConvoyDialog}
            onAddConvoy={handleOpenAddConvoyDialog}
          />
        </TabsContent>
      </Tabs>
      
      {/* Диалоговые окна для пользователей */}
      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        formData={newUserData}
        convoys={convoys}
        onFormChange={handleUserFormChange}
        onSelectChange={handleUserSelectChange}
        onSubmit={handleSubmitAddUser}
      />

      <EditUserDialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
        formData={newUserData}
        convoys={convoys}
        onFormChange={handleUserFormChange}
        onSelectChange={handleUserSelectChange}
        onSubmit={handleSubmitEditUser}
      />

      <ViewUsersDialog
        open={isViewUsersDialogOpen}
        onOpenChange={setIsViewUsersDialogOpen}
        role={selectedUserRole}
        usersByRole={usersByRole}
        onEdit={handleOpenEditUserDialog}
        onAddUser={handleOpenAddUserWithRole}
      />

      {/* Диалоговые окна для автоколонн */}
      <AddConvoyDialog
        open={isAddConvoyDialogOpen}
        onOpenChange={setIsAddConvoyDialogOpen}
        formData={newConvoyData}
        users={users}
        onFormChange={handleConvoyFormChange}
        onSelectChange={handleConvoySelectChange}
        onSubmit={handleSubmitAddConvoy}
      />

      <EditConvoyDialog
        open={isEditConvoyDialogOpen}
        onOpenChange={setIsEditConvoyDialogOpen}
        formData={newConvoyData}
        users={users}
        onFormChange={handleConvoyFormChange}
        onSelectChange={handleConvoySelectChange}
        onSubmit={handleSubmitEditConvoy}
      />

      <ViewConvoyDialog
        open={isViewConvoyDialogOpen}
        onOpenChange={setIsViewConvoyDialogOpen}
        convoy={selectedConvoy}
        users={users}
        onEdit={handleOpenEditConvoyDialog}
        onDelete={handleDeleteConvoyAndClose}
      />
    </div>
  )
}

