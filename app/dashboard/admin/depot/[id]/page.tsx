"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MapPin, Users, Plus, UserCog, Briefcase, Clock, Wrench, FileText } from "lucide-react"

// Типы данных
interface User {
  id: string
  name: string
  email: string
  role: string
  position?: string
  avatar?: string
}

interface BusDepot {
  id: string
  name: string
  city: string
  address: string
  logo?: string
}

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
    logo: ""
  })
  
  // Состояние для пользователей
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Иванов Иван Иванович",
      email: "ivanov@example.com",
      role: "fleet-manager",
      position: "Начальник колонны №1",
      avatar: ""
    },
    {
      id: "2",
      name: "Петров Петр Петрович",
      email: "petrov@example.com",
      role: "senior-dispatcher",
      position: "Старший диспетчер",
      avatar: ""
    },
    {
      id: "3",
      name: "Сидоров Сидор Сидорович",
      email: "sidorov@example.com",
      role: "dispatcher",
      position: "Диспетчер",
      avatar: ""
    },
    {
      id: "4",
      name: "Смирнов Алексей Иванович",
      email: "smirnov@example.com",
      role: "mechanic",
      position: "Механик",
      avatar: ""
    },
    {
      id: "5",
      name: "Козлова Анна Сергеевна",
      email: "kozlova@example.com",
      role: "hr",
      position: "Специалист отдела кадров",
      avatar: ""
    },
    {
      id: "6",
      name: "Морозов Дмитрий Александрович",
      email: "morozov@example.com",
      role: "taksirovka",
      position: "Специалист отдела таксировки",
      avatar: ""
    }
  ])
  
  // Состояние для модального окна добавления пользователя
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    login: "",
    password: "",
    role: "",
    position: ""
  })
  
  // Обработчик изменения полей формы
  const handleUserFormChange = (e) => {
    const { name, value } = e.target
    setNewUserData(prev => ({ ...prev, [name]: value }))
  }
  
  // Обработчик изменения выпадающих списков
  const handleSelectChange = (name: string, value: string) => {
    setNewUserData(prev => ({ ...prev, [name]: value }))
  }
  
  // Обработчик добавления нового пользователя
  const handleAddUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      position: newUserData.position,
      avatar: ""
    }
    
    setUsers(prev => [...prev, newUser])
    setNewUserData({ name: "", email: "", login: "", password: "", role: "", position: "" })
    setIsAddUserDialogOpen(false)
  }
  
  // Группировка пользователей по ролям
  const usersByRole = {
    fleetManager: users.filter(user => user.role === "fleet-manager"),
    seniorDispatcher: users.filter(user => user.role === "senior-dispatcher"),
    dispatcher: users.filter(user => user.role === "dispatcher"),
    mechanic: users.filter(user => user.role === "mechanic"),
    hr: users.filter(user => user.role === "hr"),
    taksirovka: users.filter(user => user.role === "taksirovka")
  }
  
  // Функция для получения иконки роли
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "fleet-manager":
        return <Briefcase className="h-10 w-10 text-sky-500" />
      case "senior-dispatcher":
        return <Clock className="h-10 w-10 text-amber-500" />
      case "dispatcher":
        return <Clock className="h-10 w-10 text-green-500" />
      case "mechanic":
        return <Wrench className="h-10 w-10 text-purple-500" />
      case "hr":
        return <Users className="h-10 w-10 text-rose-500" />
      case "taksirovka":
        return <FileText className="h-10 w-10 text-blue-500" />
      default:
        return <UserCog className="h-10 w-10 text-gray-500" />
    }
  }
  
  // Функция для получения названия роли
  const getRoleName = (role: string) => {
    switch (role) {
      case "fleet-manager":
        return "Начальник колонны"
      case "senior-dispatcher":
        return "Старший диспетчер"
      case "dispatcher":
        return "Диспетчер"
      case "mechanic":
        return "Механик"
      case "hr":
        return "Отдел кадров"
      case "taksirovka":
        return "Отдел таксировки"
      default:
        return "Неизвестная роль"
    }
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-sky-700">{depot.name  />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-sky-700">{depot.name}</h1>
          <p className="text-gray-500 mt-1 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {depot.city}, {depot.address}
          </p>
        </div>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Пользователи автобусного парка</h2>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить пользователя
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Карточка начальников колонн */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Начальники колонн
            </CardTitle>
            <CardDescription className="text-sky-100">
              {usersByRole.fleetManager.length} пользователей
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {usersByRole.fleetManager.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.position}</p>
                  </div>
                </div>
              ))}
              
              {usersByRole.fleetManager.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Нет пользователей с этой ролью
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsAddUserDialogOpen(true)}>
              Управлять пользователями
            </Button>
          </CardFooter>
        </Card>
        
        {/* Карточка старших диспетчеров */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Старшие диспетчеры
            </CardTitle>
            <CardDescription className="text-amber-100">
              {usersByRole.seniorDispatcher.length} пользователей
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {usersByRole.seniorDispatcher.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.position}</p>
                  </div>
                </div>
              ))}
              
              {usersByRole.seniorDispatcher.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Нет пользователей с этой ролью
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsAddUserDialogOpen(true)}>
              Управлять пользователями
            </Button>
          </CardFooter>
        </Card>
        
        {/* Карточка диспетчеров */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Диспетчеры
            </CardTitle>
            <CardDescription className="text-green-100">
              {usersByRole.dispatcher.length} пользователей
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {usersByRole.dispatcher.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.position}</p>
                  </div>
                </div>
              ))}
              
              {usersByRole.dispatcher.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Нет пользователей с этой ролью
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsAddUserDialogOpen(true)}>
              Управлять пользователями
            </Button>
          </CardFooter>
        </Card>
        
        {/* Карточка механиков */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Механики
            </CardTitle>
            <CardDescription className="text-purple-100">
              {usersByRole.mechanic.length} пользователей
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {usersByRole.mechanic.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.position}</p>
                  </div>
                </div>
              ))}
              
              {usersByRole.mechanic.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Нет пользователей с этой ролью
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsAddUserDialogOpen(true)}>
              Управлять пользователями
            </Button>
          </CardFooter>
        </Card>
        
        {/* Карточка отдела кадров */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Отдел кадров
            </CardTitle>
            <CardDescription className="text-rose-100">
              {usersByRole.hr.length} пользователей
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {usersByRole.hr.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.position}</p>
                  </div>
                </div>
              ))}
              
              {usersByRole.hr.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Нет пользователей с этой ролью
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsAddUserDialogOpen(true)}>
              Управлять пользователями
            </Button>
          </CardFooter>
        </Card>
        
        {/* Карточка отдела таксировки */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Отдел таксировки
            </CardTitle>
            <CardDescription className="text-blue-100">
              {usersByRole.taksirovka.length} пользователей
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {usersByRole.taksirovka.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.position}</p>
                  </div>
                </div>
              ))}
              
              {usersByRole.taksirovka.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Нет пользователей с этой ролью
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsAddUserDialogOpen(true)}>
              Управлять пользователями
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Диалог добавления пользователя */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить пользователя</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом пользователе
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                ФИО
              </Label>
              <Input
                id="name"
                name="name"
                value={newUserData.name}
                onChange={handleUserFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUserData.email}
                onChange={handleUserFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="login" className="text-right">
                Логин
              </Label>
              <Input
                id="login"
                name="login"
                value={newUserData.login}
                onChange={handleUserFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Пароль
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newUserData.password}
                onChange={handleUserFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Роль
              </Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fleet-manager">Начальник колонны</SelectItem>
                  <SelectItem value="senior-dispatcher">Старший диспетчер</SelectItem>
                  <SelectItem value="dispatcher">Диспетчер</SelectItem>
                  <SelectItem value="mechanic">Механик</SelectItem>
                  <SelectItem value="hr">Отдел кадров</SelectItem>
                  <SelectItem value="taksirovka">Отдел таксировки</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Должность
              </Label>
              <Input
                id="position"
                name="position"
                value={newUserData.position}
                onChange={handleUserFormChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddUser}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

