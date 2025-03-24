"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, Clock, Search, UserPlus, XCircle, Eye, User, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

// Типы данных
interface RegistrationRequest {
  id: string
  fullName: string
  email: string
  login: string
  role: string
  position: string
  busDepotId: string
  busDepotName: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  comment?: string
}

export default function RegistrationRequestsPage() {
  const router = useRouter()

  // Состояние для хранения заявок на регистрацию
  const [requests, setRequests] = useState<RegistrationRequest[]>([
    {
      id: "1",
      fullName: "Иванов Иван Иванович",
      email: "ivanov@example.com",
      login: "ivanov",
      role: "fleet-manager",
      position: "Начальник колонны №1",
      busDepotId: "1",
      busDepotName: "Центральный автобусный парк",
      status: "pending",
      createdAt: "2025-03-20T10:30:00Z",
      comment: "Прошу рассмотреть мою заявку на регистрацию",
    },
    {
      id: "2",
      fullName: "Петрова Анна Сергеевна",
      email: "petrova@example.com",
      login: "petrova",
      role: "hr",
      position: "Специалист отдела кадров",
      busDepotId: "2",
      busDepotName: "Южный автобусный парк",
      status: "pending",
      createdAt: "2025-03-21T09:15:00Z",
    },
    {
      id: "3",
      fullName: "Сидоров Алексей Петрович",
      email: "sidorov@example.com",
      login: "sidorov",
      role: "dispatcher",
      position: "Диспетчер",
      busDepotId: "1",
      busDepotName: "Центральный автобусный парк",
      status: "approved",
      createdAt: "2025-03-19T14:45:00Z",
    },
    {
      id: "4",
      fullName: "Козлов Дмитрий Иванович",
      email: "kozlov@example.com",
      login: "kozlov",
      role: "mechanic",
      position: "Механик",
      busDepotId: "3",
      busDepotName: "Северный автобусный парк",
      status: "rejected",
      createdAt: "2025-03-18T11:20:00Z",
      comment: "Дублирующая заявка",
    },
  ])

  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState("")

  // Состояние для фильтра статуса
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Состояние для модального окна просмотра заявки
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null)

  // Обработчик просмотра заявки
  const handleViewRequest = (request: RegistrationRequest) => {
    setSelectedRequest(request)
    setIsViewDialogOpen(true)
  }

  // Обработчик одобрения заявки
  const handleApproveRequest = (id: string) => {
    setRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status: "approved" } : request)))

    // Закрываем диалог, если он открыт
    if (isViewDialogOpen) {
      setIsViewDialogOpen(false)
    }
  }

  // Обработчик отклонения заявки
  const handleRejectRequest = (id: string) => {
    setRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status: "rejected" } : request)))

    // Закрываем диалог, если он открыт
    if (isViewDialogOpen) {
      setIsViewDialogOpen(false)
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

  // Функция для получения цвета и текста статуса
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-3 w-3 mr-1" />,
          text: "Ожидает рассмотрения",
        }
      case "approved":
        return {
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Одобрена",
        }
      case "rejected":
        return { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" />, text: "Отклонена" }
      default:
        return { color: "bg-gray-100 text-gray-800", icon: null, text: "Неизвестный статус" }
    }
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Фильтрация заявок
  const filteredRequests = requests.filter((request) => {
    // Фильтр по поисковому запросу
    const matchesSearch =
      searchQuery === "" ||
      request.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.busDepotName.toLowerCase().includes(searchQuery.toLowerCase())

    // Фильтр по статусу
    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-sky-700">Заявки на регистрацию</h1>
          <p className="text-gray-500 mt-1">Управление заявками пользователей на регистрацию в системе</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск заявок..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все заявки</SelectItem>
              <SelectItem value="pending">Ожидающие</SelectItem>
              <SelectItem value="approved">Одобренные</SelectItem>
              <SelectItem value="rejected">Отклоненные</SelectItem>
            </SelectContent>
          </Select>

          <Tabs defaultValue="all" className="w-auto">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                Все
              </TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
                Ожидающие
              </TabsTrigger>
              <TabsTrigger value="approved" onClick={() => setStatusFilter("approved")}>
                Одобренные
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-sky-500" />
            Заявки на регистрацию
          </CardTitle>
          <CardDescription>
            Всего заявок: {requests.length}, ожидающих: {requests.filter((r) => r.status === "pending").length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchQuery || statusFilter !== "all" ? "Заявки не найдены" : "Нет заявок на регистрацию"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Попробуйте изменить параметры поиска или фильтрации"
                  : "На данный момент нет заявок на регистрацию в системе"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Логин</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Автобусный парк</TableHead>
                    <TableHead>Дата заявки</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.fullName}</TableCell>
                      <TableCell>{request.login}</TableCell>
                      <TableCell>{getRoleName(request.role)}</TableCell>
                      <TableCell>{request.busDepotName}</TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`flex items-center ${getStatusBadge(request.status).color}`}
                        >
                          {getStatusBadge(request.status).icon}
                          {getStatusBadge(request.status).text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                            <Eye className="h-4 w-4" />
                          </Button>

                          {request.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог просмотра заявки */}
      {selectedRequest && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Просмотр заявки на регистрацию</DialogTitle>
              <DialogDescription>Детальная информация о заявке пользователя</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 pb-2 border-b">
                <Badge variant="outline" className={`${getStatusBadge(selectedRequest.status).color}`}>
                  {getStatusBadge(selectedRequest.status).text}
                </Badge>
                <span className="text-sm text-gray-500">Дата заявки: {formatDate(selectedRequest.createdAt)}</span>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">ФИО:</Label>
                <div className="col-span-3">{selectedRequest.fullName}</div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Email:</Label>
                <div className="col-span-3">{selectedRequest.email}</div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Логин:</Label>
                <div className="col-span-3">{selectedRequest.login}</div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Роль:</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-sky-500" />
                  {getRoleName(selectedRequest.role)}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Должность:</Label>
                <div className="col-span-3">{selectedRequest.position}</div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Автобусный парк:</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-sky-500" />
                  {selectedRequest.busDepotName}
                </div>
              </div>

              {selectedRequest.comment && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right font-medium">Комментарий:</Label>
                  <div className="col-span-3">{selectedRequest.comment}</div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedRequest.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Отклонить
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Одобрить
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

