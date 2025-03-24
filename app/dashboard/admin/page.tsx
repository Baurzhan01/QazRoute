// app/dashboard/admin/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bus, MapPin, Users, Plus, Upload, Search, UserPlus } from "lucide-react"

interface BusDepot {
  id: string
  name: string
  city: string
  address: string
  logo?: string
  users: {
    fleetManager: number
    seniorDispatcher: number
    dispatcher: number
    mechanic: number
    hr: number
    taksirovka: number
  }
}

export default function AdminDashboard() {
  const [busDepots, setBusDepots] = useState<BusDepot[]>([])
  const [isAddDepotDialogOpen, setIsAddDepotDialogOpen] = useState(false)
  const [newDepotData, setNewDepotData] = useState({ name: "", city: "", address: "", logo: "" })
  const [searchQuery, setSearchQuery] = useState("")

  // Получение данных с сервера
  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const res = await fetch("/api/bus-depots")
        const data = await res.json()
        setBusDepots(data)
      } catch (err) {
        console.error("Ошибка загрузки парков:", err)
      }
    }

    fetchDepots()
  }, [])

  const handleDepotFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewDepotData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddDepot = async () => {
    try {
      const res = await fetch("/api/bus-depots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDepotData),
      })

      if (!res.ok) throw new Error("Ошибка при добавлении парка")

      const createdDepot = await res.json()
      setBusDepots((prev) => [...prev, createdDepot])
      setNewDepotData({ name: "", city: "", address: "", logo: "" })
      setIsAddDepotDialogOpen(false)
    } catch (err) {
      console.error("Ошибка добавления парка:", err)
    }
  }

  const filteredDepots = searchQuery
    ? busDepots.filter(
        (depot) =>
          depot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          depot.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : busDepots

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-sky-700">Панель администратора</h1>
          <p className="text-gray-500 mt-1">Управление автобусными парками и пользователями</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск автобусных парков..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Link href="/dashboard/admin/registration-requests">
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Заявки на регистрацию</span>
              <Badge variant="secondary" className="ml-1">3</Badge>
            </Button>
          </Link>

          <Tabs defaultValue="depots" className="w-auto">
            <TabsList>
              <TabsTrigger value="depots">Автобусные парки</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Автобусные парки</h2>
        <Button onClick={() => setIsAddDepotDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить автобусный парк
        </Button>
      </div>

      {filteredDepots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Bus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery ? "Автобусные парки не найдены" : "Нет автобусных парков"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? `По запросу "${searchQuery}" ничего не найдено`
              : "Добавьте первый автобусный парк, чтобы начать работу"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsAddDepotDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить автобусный парк
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepots.map((depot) => (
            <Card key={depot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white pb-12 relative">
                <div className="absolute right-4 top-4">
                  <Avatar className="h-10 w-10 bg-white text-sky-600">
                    <AvatarImage src={depot.logo} alt={depot.name} />
                    <AvatarFallback>
                      <Bus className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{depot.name}</CardTitle>
                <CardDescription className="text-sky-100 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {depot.city}, {depot.address}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">Начальники: {depot.users.fleetManager}</Badge>
                  <Badge variant="outline">Диспетчеры: {depot.users.dispatcher + depot.users.seniorDispatcher}</Badge>
                  <Badge variant="outline">Другие: {depot.users.mechanic + depot.users.hr + depot.users.taksirovka}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Всего пользователей: {Object.values(depot.users).reduce((a, b) => a + b, 0)}
                  </span>
                  <Link href={`/dashboard/admin/depot/${depot.id}`}>
                    <Button variant="ghost" size="sm">
                      Управлять
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDepotDialogOpen} onOpenChange={setIsAddDepotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить автобусный парк</DialogTitle>
            <DialogDescription>Заполните информацию о новом автобусном парке</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Название</Label>
              <Input name="name" value={newDepotData.name} onChange={handleDepotFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">Город</Label>
              <Input name="city" value={newDepotData.city} onChange={handleDepotFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Адрес</Label>
              <Input name="address" value={newDepotData.address} onChange={handleDepotFormChange} className="col-span-3" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDepotDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddDepot}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
