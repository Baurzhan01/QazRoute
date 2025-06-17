"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Wrench,
  Clock,
  AlertCircle,
  Bell,
  UserCircle,
  Truck,
  AlertTriangle,
  BarChart2,
  FileText,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

function getRolePath(role: string) {
  return role.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("default");
  const [dashboardPath, setDashboardPath] = useState("/dashboard");

  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const user = JSON.parse(authData);
      const roleKey = user.role?.toLowerCase();
      setRole(roleKey || "default");
      setDashboardPath(`/dashboard/${getRolePath(user.role)}`);
    }
  }, []);

  const isCTS = role === "cts" || role === "on-duty-mechanic";

  const ctsNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/cts", icon: <Home className="h-5 w-5" /> },
     // 🟦 Добавляем Разнарядку
    { title: "Разнарядка", href: "/dashboard/cts/release-plan", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Плановый ремонт", href: "/dashboard/cts/repairs/plan", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Неплановый ремонт", href: "/dashboard/cts/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Прочий ремонт", href: "/dashboard/cts/other-repairs", icon: <AlertCircle className="h-5 w-5" /> },
    { title: "Длительный ремонт", href: "/dashboard/cts/long-repairs", icon: <Clock className="h-5 w-5" /> },
    { title: "Сообщения", href: "/dashboard/cts/notifications", icon: <Bell className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const defaultNavItems: NavItem[] = [
    { title: "Панель управления", href: dashboardPath, icon: <Home className="h-5 w-5 text-sky-500" /> },
    { title: "Список автобусов", href: "/dashboard/fleet-manager/buses", icon: <Truck className="h-5 w-5 text-sky-500" /> },
    { title: "Сходы с линии", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
    { title: "Журнал ремонтов", href: "/dashboard/repairs", icon: <ClipboardList className="h-5 w-5 text-sky-500" /> },
    { title: "Отчёты", href: "/dashboard/fleet-manager/reports", icon: <FileText className="h-5 w-5 text-sky-500" /> },
    { title: "Настройки", href: `${dashboardPath}/settings`, icon: <Settings className="h-5 w-5 text-sky-500" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5 text-sky-500" /> },
  ];

  const navItems = isCTS ? ctsNavItems : defaultNavItems;

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">
          <span className="text-sky-500">Qaz</span>
          <span className="text-yellow-400">Route</span>
          <span className="text-gray-700"> ERP</span>
        </h2>
        <p className="text-sm text-gray-500">Система управления автопарком</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100",
              pathname === item.href && "bg-sky-50 text-sky-600"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t text-xs text-gray-500">
        © {new Date().getFullYear()} Автобусный парк №1
      </div>
    </aside>
  );
}
