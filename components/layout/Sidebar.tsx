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
  UserCircle,
  Truck,
  AlertTriangle,
  Briefcase,
  BarChart2,
  FileText,
  Users,
  User,
  Bell,
  Settings,
  CalendarCheck,
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

  // --- меню для механика ---
  const mechanicNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mechanic", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов автобусов", href: "/dashboard/mechanic/repairs", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Реестры ремонтов", href: "/dashboard/mechanic/repair-registers", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Список автобусов", href: "/dashboard/mechanic/buses", icon: <Truck className="h-5 w-5" /> },
    { title: "Сходы с линии", href: "/dashboard/mechanic/breakdowns", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- меню для КТС ---
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

  // --- меню для МЦК ---
  const mccNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mcc", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/mcc/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/mcc/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- меню для LRT ---
  const lrtNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/lrt", icon: <Home className="h-5 w-5" /> },
    { title: "Сходы с линии", href: "/dashboard/lrt/breakdowns", icon: <Wrench className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- меню для Руководства ---
  const guideNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/guide", icon: <Home className="h-5 w-5" /> },
    { title: "Автоколонны", href: "/dashboard/guide/convoys", icon: <Truck className="h-5 w-5" /> },
    { title: "Сходы", href: "/dashboard/guide/incidents", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Ремонты", href: "/dashboard/guide/repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Реестры ремонтов", href: "/dashboard/guide/repair-registers", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Отчеты", href: "/dashboard/guide/reports", icon: <BarChart2 className="h-5 w-5" /> },
  ];

  // --- меню для диспетчера ---
  const dispatcherNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/dispatcher", icon: <Home className="h-5 w-5" /> },
    { title: "План выпуска", href: "/dashboard/dispatcher/release-plan", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Ведомость", href: "/dashboard/dispatcher/final-dispatch", icon: <FileText className="h-5 w-5" /> },
    { title: "Сходы с линии", href: "/dashboard/dispatcher/departures-drop", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Плановый ремонт", href: "/dashboard/dispatcher/maintenance-plan", icon: <Wrench className="h-5 w-5" /> },
    { title: "Дьюти", href: "/dashboard/dispatcher/duty", icon: <Briefcase className="h-5 w-5" /> },
    { title: "Отчеты", href: "/dashboard/dispatcher/reports", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- меню по умолчанию ---
  const defaultNavItems: NavItem[] = [
    { title: "Панель управления", href: dashboardPath, icon: <Home className="h-5 w-5 text-sky-500" /> },
    { title: "Список автобусов", href: "/dashboard/fleet-manager/buses", icon: <Truck className="h-5 w-5 text-sky-500" /> },
    { title: "Сходы с линии", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
    { title: "Журнал ремонтов", href: "/dashboard/repairs", icon: <ClipboardList className="h-5 w-5 text-sky-500" /> },
    { title: "Табель", href: "/dashboard/timesheet", icon: <CalendarCheck className="h-5 w-5 text-sky-500" /> },
    { title: "Отчёты", href: "/dashboard/fleet-manager/reports", icon: <FileText className="h-5 w-5 text-sky-500" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5 text-sky-500" /> },
  ];

  // --- меню для старшего диспетчера ---
  const seniorDispatcherNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/senior-dispatcher", icon: <Home className="h-5 w-5" /> },
    { title: "Сходы с линии", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
    { title: "Управление диспетчерами", href: "/dashboard/senior-dispatcher/dispatchers", icon: <Users className="h-5 w-5" /> },
    { title: "Справочник данных водителей", href: "/dashboard/senior-dispatcher/drivers", icon: <User className="h-5 w-5" /> },
    { title: "Табель рабочего времени", href: "/dashboard/senior-dispatcher/shift-table", icon: <Clock className="h-5 w-5" /> },
    { title: "Расписание маршрутов", href: "/dashboard/senior-dispatcher/routes", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Плановые заявки на заказ", href: "/dashboard/senior-dispatcher/routes/plan-orders", icon: <FileText className="h-5 w-5" /> },
    { title: "Отчеты", href: "/dashboard/senior-dispatcher/reports", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Дьюти", href: "/dashboard/dispatcher/duty", icon: <Briefcase className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // выбор меню по роли
  const navItems =
    role === "mechanic" ? mechanicNavItems :
    role === "mcc" ? mccNavItems :
    role === "cts" || role === "on-duty-mechanic" ? ctsNavItems :
    role === "dispatcher" ? dispatcherNavItems :
    role === "senior-dispatcher" || role === "seniordispatcher" ? seniorDispatcherNavItems :
    role === "lrt" ? lrtNavItems :
    role === "guide" ? guideNavItems :
    defaultNavItems;

  return (
    <aside className="hidden md:flex w-66 flex-col bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">
          <span className="text-sky-500">Qaz</span>
          <span className="text-yellow-400">Route</span>
          <span className="text-gray-700"> ERP</span>
        </h2>
        <p className="text-sm text-gray-500">Система управления транспортом</p>
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
        © {new Date().getFullYear()} QazRoute
      </div>
    </aside>
  );
}
