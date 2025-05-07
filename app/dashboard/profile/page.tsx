"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle2, Mail, ShieldCheck, Clock, Key, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function ProfilePage() {
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lastLogin] = useState("Не указано"); // можно будет подключить позже

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("authData");
      if (authData) {
        const parsed = JSON.parse(authData);
        setUser({
          fullName: parsed.fullName,
          role: parsed.role,
        });
      }
    }
  }, []);

  const handleSave = () => {
    // В реальном проекте здесь будет запрос к API для сохранения данных
    alert("Данные успешно сохранены!");
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Личный кабинет</h1>

      <Card className="max-w-md">
        <CardHeader className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-sky-100 flex items-center justify-center">
            <UserCircle2 className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <CardTitle className="text-xl">{user?.fullName ?? "Гость"}</CardTitle>
            <p className="text-gray-500 capitalize">{user?.role ? formatRole(user?.role) : "Пользователь"}</p>
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
            <p className="font-medium capitalize">{user?.role ? formatRole(user?.role) : "Пользователь"}</p>
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
  );
}

function formatRole(role: string | undefined) {
  if (!role) return "Пользователь";
  return role.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}
