"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/app/api/apiService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, LockKeyhole, User, CheckCircle2, Loader2 } from "lucide-react"
import { log } from "console"

// Обновляем компонент LoginPage, добавляя состояние для автобусных парков и обработку заявки
export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(3)
  const [showAdminContactDialog, setShowAdminContactDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)

  // Состояние для формы заявки на регистрацию
  const [registrationRequest, setRegistrationRequest] = useState({
    fullName: "",
    email: "",
    login: "",
    password: "",
    position: "",
    role: "",
    busDepotId: "",
    comment: "",
  })

  // Имитация списка автобусных парков (в реальном приложении это будет API запрос)
  const [busDepots, setBusDepots] = useState([
    { id: "1", name: "Центральный автобусный парк" },
    { id: "2", name: "Южный автобусный парк" },
    { id: "3", name: "Северный автобусный парк" },
  ])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения полей формы заявки
  const handleRequestChange = (e) => {
    const { name, value } = e.target
    setRegistrationRequest((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения выпадающих списков
  const handleSelectChange = (name: string, value: string) => {
    setRegistrationRequest((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик отправки заявки на регистрацию
  const handleSubmitRequest = async () => {
    setIsRequestSubmitting(true)

    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // В реальном приложении здесь будет отправка данных на сервер
      console.log("Отправка заявки на регистрацию:", registrationRequest)

      // Сброс формы и отображение сообщения об успехе
      setRequestSuccess(true)
      setRegistrationRequest({
        fullName: "",
        email: "",
        login: "",
        password: "",
        position: "",
        role: "",
        busDepotId: "",
        comment: "",
      })

      // Закрытие диалога через 3 секунды после успешной отправки
      setTimeout(() => {
        setShowAdminContactDialog(false)
        setRequestSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Ошибка при отправке заявки:", error)
    } finally {
      setIsRequestSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
  
    try {
      const response = await authService.login(formData)
  
      if (!response.isSuccess) {
        // Уменьшаем количество попыток
        setAttempts((prev) => prev - 1)
  
        // Если пользователь не найден
        if (response.message?.includes("UserNotFound") || response.message?.includes("не найден")) {
          setError("Пользователь с таким логином не найден")
          setIsLoading(false)
          return
        }
  
        // Если неверный пароль
        if (response.message?.includes("InvalidPassword") || response.message?.includes("неверный")) {
          if (attempts <= 1) {
            setError("Превышено количество попыток. Обратитесь к администрации портала")
          } else {
            setError(`Неверный пароль. Осталось попыток: ${attempts - 1}`)
          }
          setIsLoading(false)
          return
        }
  
        // Другие ошибки
        setError("Ошибка при входе: " + (response.message || "Неизвестная ошибка"))
        setIsLoading(false)
        return
      }
  
      // Если вход успешен — сохраняем токен и делаем редирект по роли
      const { token, role } = response.value
  
      localStorage.setItem("authToken", token)
      const normalizedRole = role
      .replace(/([a-z])([A-Z])/g, "$1-$2") // добавляет дефис между словами
      .toLowerCase()

      router.push(`/dashboard/${normalizedRole}`) // Например: /dashboard/admin
    } catch (err) {
      console.error("Ошибка входа:", err)
      setError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-white p-4">
      <Link href="/" className="absolute left-8 top-8 flex items-center text-sky-700">
        <img src="/images/logo-qazroute.png" alt="QAZROUTE" className="h-20 w-auto mr-2" />
        <span className="font-bold">Управление автобусным парком</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-sky-700">Вход</CardTitle>
          <CardDescription className="text-center">Введите ваши данные для доступа к аккаунту</CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6 pb-3">
            <Alert variant={attempts <= 0 ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="login"
                  name="login"
                  placeholder="Введите ваш логин"
                  required
                  className="pl-10"
                  value={formData.login}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Введите ваш пароль"
                  required
                  className="pl-10"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={isLoading || attempts <= 0}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>

            {(error === "Пользователь с таким логином не найден" || attempts <= 0) && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAdminContactDialog(true)}
              >
                Обратиться к администрации портала
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Диалог обращения к администрации */}
      <Dialog open={showAdminContactDialog} onOpenChange={setShowAdminContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Обращение к администрации портала</DialogTitle>
            <DialogDescription>Выберите тип обращения к администрации</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Забыли пароль</TabsTrigger>
              <TabsTrigger value="register">Подать заявку</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-login">Логин или Email</Label>
                <Input id="recovery-login" placeholder="Введите ваш логин или email" />
              </div>
              <Button className="w-full">Отправить запрос на восстановление</Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 py-4">
              {requestSuccess ? (
                <div className="py-6">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Заявка отправлена</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Ваша заявка на регистрацию успешно отправлена. Администратор рассмотрит её и свяжется с вами.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">ФИО</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={registrationRequest.fullName}
                      onChange={handleRequestChange}
                      placeholder="Введите ваше полное имя"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={registrationRequest.email}
                      onChange={handleRequestChange}
                      type="email"
                      placeholder="Введите ваш email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login">Логин</Label>
                    <Input
                      id="login"
                      name="login"
                      value={registrationRequest.login}
                      onChange={handleRequestChange}
                      placeholder="Придумайте логин"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      name="password"
                      value={registrationRequest.password}
                      onChange={handleRequestChange}
                      type="password"
                      placeholder="Придумайте пароль"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <Select
                      value={registrationRequest.role}
                      onValueChange={(value) => handleSelectChange("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите вашу роль" />
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
                  <div className="space-y-2">
                    <Label htmlFor="position">Должность</Label>
                    <Input
                      id="position"
                      name="position"
                      value={registrationRequest.position}
                      onChange={handleRequestChange}
                      placeholder="Укажите вашу должность"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="busDepotId">Автобусный парк</Label>
                    <Select
                      value={registrationRequest.busDepotId}
                      onValueChange={(value) => handleSelectChange("busDepotId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите автобусный парк" />
                      </SelectTrigger>
                      <SelectContent>
                        {busDepots.map((depot) => (
                          <SelectItem key={depot.id} value={depot.id}>
                            {depot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий</Label>
                    <Input
                      id="comment"
                      name="comment"
                      value={registrationRequest.comment}
                      onChange={handleRequestChange}
                      placeholder="Дополнительная информация"
                    />
                  </div>
                  <Button className="w-full" onClick={handleSubmitRequest} disabled={isRequestSubmitting}>
                    {isRequestSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      "Отправить заявку"
                    )}
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAdminContactDialog(false)
                setRequestSuccess(false)
              }}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

