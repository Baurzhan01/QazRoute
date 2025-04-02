"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { authService } from "@/app/api/apiService"
import { AlertCircle, LockKeyhole, User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ login: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await authService.login(formData)

      const isLoginError =
        !response.value || response.statusCode >= 400 || !!response.error

      if (isLoginError) {
        setError("Логин или пароль неверны")
        setIsLoading(false)
        return
      }

      if (!response.value) {
        setError("Ошибка при получении данных пользователя")
        setIsLoading(false)
        return
      }

      const { token, role } = response.value
      //localStorage.setItem("authToken", token)

      const normalizedRole = role
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase()

      router.push(`/dashboard/${normalizedRole}`)
    } catch (err: any) {
      setError("Ошибка при входе. Попробуйте позже.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-white p-4 relative">
      {/* ✅ ЛОГО И ТЕКСТ */}
      <Link href="/" className="absolute left-8 top-8 flex items-center text-sky-700">
        <img src="/images/logo-qazroute.png" alt="QAZROUTE" className="h-20 w-auto mr-3" />
        <span className="font-bold">Управление автобусным парком</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-sky-700">Вход</CardTitle>
          <CardDescription className="text-center">
            Введите логин и пароль для входа
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6 pb-3">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="login">Логин</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="login"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  placeholder="Введите логин"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введите пароль"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
