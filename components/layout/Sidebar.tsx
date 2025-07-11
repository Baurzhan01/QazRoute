// components/layout/Sidebar.tsx
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
  Briefcase,
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

  const ctsNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/cts", icon: <Home className="h-5 w-5" /> },
    { title: "Разнарядка", href: "/dashboard/cts/release-plan", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Плановый ремонт", href: "/dashboard/cts/repairs/plan", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Неплановый ремонт", href: "/dashboard/cts/repairs/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Прочий ремонт", href: "/dashboard/cts/repairs/other-repairs", icon: <AlertCircle className="h-5 w-5" /> },
    { title: "Длительный ремонт", href: "/dashboard/cts/repairs/long-repairs", icon: <Clock className="h-5 w-5" /> },
    { title: "Отчёт", href: "/dashboard/cts/report", icon: <FileText className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const mccNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mcc", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/mcc/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/mcc/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const lrtNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/lrt", icon: <Home className="h-5 w-5" /> },
    { title: "Документы", href: "/dashboard/lrt/documents", icon: <FileText className="h-5 w-5" /> },
    { title: "Ремонт", href: "/dashboard/lrt/repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/lrt/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];
  
  const guideNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/guide", icon: <Home className="h-5 w-5" /> },
    { title: "Отчёты", href: "/dashboard/guide/reports", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Контроль", href: "/dashboard/guide/overview", icon: <Users className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/guide/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];  

  const dispatcherNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/dispatcher", icon: <Home className="h-5 w-5" /> },
    { title: "План выпуска", href: "/dashboard/dispatcher/release-plan", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Ведомость", href: "/dashboard/dispatcher/final-dispatch", icon: <FileText className="h-5 w-5" /> },
    { title: "Сходы с линии", href: "/dashboard/dispatcher/departures-drop", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Плановый ремонт", href: "/dashboard/dispatcher/maintenance-plan", icon: <Wrench className="h-5 w-5" /> },
    { title: "Дьюти", href: "/dashboard/dispatcher/duty", icon: <Briefcase className="h-5 w-5" /> },
    { title: "Отчеты", href: "/dashboard/dispatcher/reports", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ]

  const defaultNavItems: NavItem[] = [
    { title: "Панель управления", href: dashboardPath, icon: <Home className="h-5 w-5 text-sky-500" /> },
    { title: "Список автобусов", href: "/dashboard/fleet-manager/buses", icon: <Truck className="h-5 w-5 text-sky-500" /> },
    { title: "Сходы с линии", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
    { title: "Журнал ремонтов", href: "/dashboard/repairs", icon: <ClipboardList className="h-5 w-5 text-sky-500" /> },
    { title: "Отчёты", href: "/dashboard/fleet-manager/reports", icon: <FileText className="h-5 w-5 text-sky-500" /> },
    { title: "Настройки", href: `${dashboardPath}/settings`, icon: <Settings className="h-5 w-5 text-sky-500" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5 text-sky-500" /> },
  ];

  const navItems =
  role === "mcc" ? mccNavItems :
  role === "cts" || role === "on-duty-mechanic" ? ctsNavItems :
  role === "dispatcher" ? dispatcherNavItems :
  role === "lrt" ? lrtNavItems :
  role === "guide" ? guideNavItems :
  defaultNavItems;


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
