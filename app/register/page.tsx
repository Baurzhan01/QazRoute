"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, Bus, User, ClipboardList, RouteIcon as Road, MapPin, CheckCircle2 } from "lucide-react"
import { authService } from "@/app/api/apiService"
import { useToast } from "@/components/ui/use-toast"

// Схема валидации формы
const formSchema = z.object({
  fullName: z.string().min(1, "Введите ваше полное имя"),
  email: z.string().email("Введите корректный email адрес"),
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  role: z.string().min(1, "Выберите вашу должность"),
})

type FormValues = z.infer<typeof formSchema>

// Данные для карусели
const carouselItems = [
  {
    icon: <Bus className="h-16 w-16 text-sky-600" />,
    title: "Управление автопарком",
    description: "Контроль и мониторинг состояния всех транспортных средств",
  },
  {
    icon: <User className="h-16 w-16 text-sky-600" />,
    title: "Профессиональные водители",
    description: "Управление персоналом и графиками работы водителей",
  },
  {
    icon: <ClipboardList className="h-16 w-16 text-sky-600" />,
    title: "План выпуска",
    description: "Эффективное планирование выпуска автобусов на маршруты",
  },
  {
    icon: <Road className="h-16 w-16 text-sky-600" />,
    title: "Контроль маршрутов",
    description: "Оптимизация и мониторинг маршрутов движения",
  },
  {
    icon: <MapPin className="h-16 w-16 text-sky-600" />,
    title: "Остановки и расписания",
    description: "Управление расписаниями и остановками на маршрутах",
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  // Инициализация формы
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      login: "",
      password: "",
      role: "",
    },
  })

  // Автоматическая прокрутка карусели
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Обработчик отправки формы
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await authService.register({
        fullName: data.fullName,
        email: data.email,
        login: data.login,
        password: data.password,
        role: data.role,
      })

      if (response.isSuccess) {
        setSuccess(true)
        toast({
          title: "Регистрация успешна",
          description: "Вы успешно зарегистрированы. Теперь вы можете войти в систему.",
        })

        // Перенаправление на страницу входа через 2 секунды
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(response.error || "Произошла ошибка при регистрации")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка при регистрации")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Левая часть - карусель */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-sky-200/90 to-yellow-100/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-300/30 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center justify-center w-full p-8 z-10">
          <Link href="/" className="flex items-center mb-12">
            <img src="/images/logo-qazroute.png" alt="QAZROUTE" className="h-8 w-auto mr-2" />
            <span className="font-bold text-xl text-sky-700">Управление автобусным парком</span>
          </Link>

          <div className="relative w-full h-80">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
              >
                <div className="bg-white/80 p-8 rounded-2xl shadow-lg flex flex-col items-center">
                  {carouselItems[activeSlide].icon}
                  <h3 className="text-xl font-bold mt-4 text-sky-700">{carouselItems[activeSlide].title}</h3>
                  <p className="text-gray-600 mt-2">{carouselItems[activeSlide].description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex space-x-2 mt-6">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  activeSlide === index ? "bg-sky-600" : "bg-sky-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Правая часть - форма регистрации */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-sky-700">Регистрация</CardTitle>
              <CardDescription className="text-center">
                Создайте аккаунт для доступа к системе управления автопарком
              </CardDescription>
            </CardHeader>

            {error && (
              <div className="px-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ошибка</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {success && (
              <div className="px-6">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Успешная регистрация</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Вы успешно зарегистрированы. Сейчас вы будете перенаправлены на страницу входа.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Полное имя</FormLabel>
                        <FormControl>
                          <Input placeholder="Иванов Иван Иванович" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Электронная почта</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="login"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Логин</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Должность</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите вашу должность" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fleet-manager">Менеджер автопарка</SelectItem>
                            <SelectItem value="mechanic">Механик</SelectItem>
                            <SelectItem value="senior-dispatcher">Старший диспетчер</SelectItem>
                            <SelectItem value="dispatcher">Диспетчер</SelectItem>
                            <SelectItem value="on-duty-mechanic">Дежурный механик</SelectItem>
                            <SelectItem value="hr">Отдел кадров</SelectItem>
                            <SelectItem value="payroll">Бухгалтерия</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Регистрация...
                      </>
                    ) : (
                      "Зарегистрироваться"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <div className="text-sm text-gray-600">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-sky-600 hover:underline font-medium">
                  Войти
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

