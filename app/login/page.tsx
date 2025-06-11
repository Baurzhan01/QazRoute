"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/app/api/apiService"
import { cn } from "@/lib/utils"
import LoginCarousel from "./components/login-carousel"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ login: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function normalizeRolePath(role: string): string {
    const map: Record<string, string> = {
      CTS: "cts",
      MCC: "mcc",
      fleetManager: "fleet-manager",
      seniorDispatcher: "senior-dispatcher",
      dispatcher: "dispatcher",
      hr: "hr",
      taskInspector: "task-inspector",
      admin: "admin"
    }
  
    return map[role] || role.toLowerCase()
  }
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await authService.login(formData)

      const isLoginError =
        !response.isSuccess || !response.value || response.statusCode >= 400 || !!response.error

      if (isLoginError) {
        setError(response.error || "Логин или пароль неверны")
        return
      }

      if (response.value) {
        const { role } = response.value
        const normalizedRole = normalizeRolePath(role)
        router.push(`/dashboard/${normalizedRole}`)
      }
    } catch {
      setError("Ошибка при входе. Попробуйте позже.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Карусель — безопасна после правки */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 bg-gray-900 relative overflow-hidden">
        <LoginCarousel />
      </div>

      {/* Форма входа */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 bg-gradient-to-br from-white via-sky-50 to-sky-100">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-lg font-bold">
                <span className="text-sky-500">Q</span><span className="text-yellow-500">R</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-sky-500">Qaz</span><span className="text-yellow-500">Route</span><span className="text-gray-700"> ERP</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">ERP-система автобусного парка</p>
          </div>

          <div className="bg-white p-6 shadow-soft rounded-xl border border-gray-200">
            <h2 className="text-center text-lg font-semibold mb-6 text-gray-800">Авторизуйтесь</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="login">Логин</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="login"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    placeholder="Введите логин"
                    className={cn("pl-10", error && "border-red-500 focus-visible:ring-red-500")}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Введите пароль"
                    className={cn("pl-10", error && "border-red-500 focus-visible:ring-red-500")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm p-2 bg-red-50 rounded-md">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Вход..." : "Войти"}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Автобусный парк №1, г. Астана</p>
            <div className="mt-2 flex justify-center space-x-4">
              <Link href="/" className="hover:text-sky-600 transition-colors">На главную</Link>
              <Link href="#" className="hover:text-sky-600 transition-colors">Документация</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Лоадер */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600" />
        </div>
      )}
    </div>
  )
}
