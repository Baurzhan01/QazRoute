"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Home, Truck, AlertTriangle, ClipboardList, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

function getRolePath(role: string) {
  return role.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function getInitialDashboardPath() {
  if (typeof window !== "undefined") {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const user = JSON.parse(authData);
      return `/dashboard/${getRolePath(user.role)}`;
    }
  }
  return "/dashboard";
}

export default function Sidebar() {
  const pathname = usePathname();
  const [dashboardPath, setDashboardPath] = useState("/dashboard");

  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const user = JSON.parse(authData);
      setDashboardPath(`/dashboard/${getRolePath(user.role)}`);
    }
  }, []);

  const navItems = [
    { title: "Панель управления", href: dashboardPath, icon: <Home className="h-5 w-5 text-sky-500" /> },
    { title: "Список автобусов", href: "/dashboard/fleet-manager/buses", icon: <Truck className="h-5 w-5 text-sky-500" /> },
    { title: "Сходы с линии", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
    { title: "Журнал ремонтов", href: "/dashboard/repairs", icon: <ClipboardList className="h-5 w-5 text-sky-500" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <User className="h-5 w-5 text-sky-500" /> },
  ];

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
        © 2025 Автобусный парк №1
      </div>
    </aside>
  );
}
