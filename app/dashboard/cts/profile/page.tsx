"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Clock, ShieldCheck, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface UserInfo {
  fullName: string;
  role: string;
  email?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loginTime, setLoginTime] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("authData");
    if (auth) {
      const parsed = JSON.parse(auth);
      if (parsed.role !== "on-duty-mechanic") {
        router.replace("/dashboard"); // если не КТС — редирект
        return;
      }
      setUser(parsed);
      setLoginTime(format(new Date(), "d MMMM yyyy, HH:mm", { locale: ru }));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authData");
    router.push("/login");
  };

  if (!user) {
    return <p className="text-gray-500">Загрузка данных...</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader className="flex items-center gap-3">
          <User className="h-8 w-8 text-sky-600" />
          <CardTitle>Профиль КТС</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-800">
          <div>
            <p className="text-muted-foreground">👤 ФИО:</p>
            <p className="font-semibold text-base">{user.fullName}</p>
          </div>

          <div>
            <p className="text-muted-foreground">🛡 Роль:</p>
            <p className="capitalize text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Дежурный механик
            </p>
          </div>

          {user.email && (
            <div>
              <p className="text-muted-foreground">📧 Email:</p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground">⏰ Время входа:</p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> {loginTime}
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={handleLogout}
            className="mt-4 w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
