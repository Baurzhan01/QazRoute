"use client"

import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import {
  UserCircle2,
  Mail,
  ShieldCheck,
  Clock,
  Key,
  Save,
  Camera,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export default function MCCProfilePage() {
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [lastLogin] = useState("Не указано")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("authData")
      if (authData) {
        const parsed = JSON.parse(authData)
        setUser({
          fullName: parsed.fullName,
          role: parsed.role,
        })
        setAvatar("/images/default-avatar.png") // TODO: заменить на avatarUrl с сервера
      }
    }
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    toast({
      title: "Сохранено",
      description: "Изменения успешно сохранены",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Личный кабинет</h1>

      <Card className="max-w-xl">
        <CardHeader className="flex items-center gap-4">
          <div className="relative group w-20 h-20 rounded-full border-2 border-sky-400 overflow-hidden cursor-pointer">
            <img
              src={avatar || "/images/default-avatar.png"}
              alt="avatar"
              className="object-cover w-full h-full"
              onClick={() => fileInputRef.current?.click()}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Camera className="text-white w-5 h-5" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <CardTitle className="text-xl">{user?.fullName ?? "Гость"}</CardTitle>
            {user?.role && (
              <Badge variant="outline" className="mt-1 capitalize">
                {formatRole(user.role)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-sm text-gray-700">
          <div className="space-y-2">
            <label className="text-gray-500 text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email
            </label>
            <Input
              type="email"
              placeholder="Введите Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-500 text-sm flex items-center gap-2">
              <Key className="h-4 w-4" /> Новый пароль
            </label>
            <Input
              type="password"
              placeholder="Введите новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-500 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Роль
            </label>
            <p className="font-medium capitalize">
              {formatRole(user?.role)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-gray-500 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Последний вход
            </label>
            <p className="font-medium">{lastLogin}</p>
          </div>

          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Сохранить изменения
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function formatRole(role?: string): string {
  if (!role) return "пользователь"
  return role.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()
}
