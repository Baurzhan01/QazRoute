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
  Package,
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

  // --- Навигация: механик ---
  const mechanicNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mechanic", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/mechanic/repairs", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Регистры ремонтов", href: "/dashboard/mechanic/repair-registers", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Каталог автобусов", href: "/dashboard/mechanic/buses", icon: <Truck className="h-5 w-5" /> },
    { title: "Выявленные дефекты", href: "/dashboard/mechanic/breakdowns", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- Навигация: ЦТС ---
  const ctsNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/cts", icon: <Home className="h-5 w-5" /> },
    { title: "Разнарядка", href: "/dashboard/cts/release-plan", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Плановый ремонт", href: "/dashboard/cts/repairs/plan", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Неплановый ремонт", href: "/dashboard/cts/repairs/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Прочий ремонт", href: "/dashboard/cts/repairs/other-repairs", icon: <AlertCircle className="h-5 w-5" /> },
    { title: "Длительный ремонт", href: "/dashboard/cts/repairs/long-repairs", icon: <Clock className="h-5 w-5" /> },
    { title: "Журнал агрегатов", href: "/dashboard/cts/aggregates", icon: <Package className="h-5 w-5" /> },
    { title: "Отчёт", href: "/dashboard/cts/report", icon: <FileText className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- Навигация: MCC ---
  const mccNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mcc", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/mcc/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/mcc/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- Навигация: LRT ---
  const lrtNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/lrt", icon: <Home className="h-5 w-5" /> },
    { title: "Выявленные дефекты", href: "/dashboard/lrt/breakdowns", icon: <Wrench className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- Навигация: ОТК ---
  const otkNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/otk", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал агрегатов", href: "/dashboard/otk/journal", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- Навигация: справочник ---
  const guideNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/guide", icon: <Home className="h-5 w-5" /> },
    { title: "Колонны", href: "/dashboard/guide/convoys", icon: <Truck className="h-5 w-5" /> },
    { title: "События", href: "/dashboard/guide/incidents", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Ремонты", href: "/dashboard/guide/repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Регистры ремонтов", href: "/dashboard/guide/repair-registers", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Отчёты", href: "/dashboard/guide/reports", icon: <BarChart2 className="h-5 w-5" /> },
  ];

  // --- Навигация: диспетчер ---
  const dispatcherNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/dispatcher", icon: <Home className="h-5 w-5" /> },
    { title: "Разнарядка", href: "/dashboard/dispatcher/release-plan", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Финальный выпуск", href: "/dashboard/dispatcher/final-dispatch", icon: <FileText className="h-5 w-5" /> },
    { title: "Сходы", href: "/dashboard/dispatcher/departures-drop", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "План ТО", href: "/dashboard/dispatcher/maintenance-plan", icon: <Wrench className="h-5 w-5" /> },
    { title: "Дежурство", href: "/dashboard/dispatcher/duty", icon: <Briefcase className="h-5 w-5" /> },
    { title: "Отчёты", href: "/dashboard/dispatcher/reports", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // --- Навигация: дефолт ---
  const defaultNavItems: NavItem[] = [
    { title: "Рабочий стол", href: dashboardPath, icon: <Home className="h-5 w-5 text-sky-500" /> },
    { title: "Каталог автобусов", href: "/dashboard/fleet-manager/buses", icon: <Truck className="h-5 w-5 text-sky-500" /> },
    { title: "Выявленные дефекты", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
    { title: "Журнал ремонтов", href: "/dashboard/repairs", icon: <ClipboardList className="h-5 w-5 text-sky-500" /> },
    { title: "Табель", href: "/dashboard/timesheet", icon: <CalendarCheck className="h-5 w-5 text-sky-500" /> },
    { title: "Отчёты", href: "/dashboard/fleet-manager/reports", icon: <FileText className="h-5 w-5 text-sky-500" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5 text-sky-500" /> },
  ];

  // --- Навигация: старший диспетчер ---
  const seniorDispatcherNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/senior-dispatcher", icon: <Home className="h-5 w-5" /> },
    { title: "Выявленные дефекты", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
    { title: "Список диспетчеров", href: "/dashboard/senior-dispatcher/dispatchers", icon: <Users className="h-5 w-5" /> },
    { title: "Водители", href: "/dashboard/senior-dispatcher/drivers", icon: <User className="h-5 w-5" /> },
    { title: "Расписание смен", href: "/dashboard/senior-dispatcher/shift-table", icon: <Clock className="h-5 w-5" /> },
    { title: "Маршруты", href: "/dashboard/senior-dispatcher/routes", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "План заказ-нарядов", href: "/dashboard/senior-dispatcher/routes/plan-orders", icon: <FileText className="h-5 w-5" /> },
    { title: "Отчёты", href: "/dashboard/senior-dispatcher/reports", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Дежурство", href: "/dashboard/dispatcher/duty", icon: <Briefcase className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const navItems =
    role === "mechanic" ? mechanicNavItems :
    role === "mcc" ? mccNavItems :
    role === "cts" || role === "on-duty-mechanic" ? ctsNavItems :
    role === "otk" ? otkNavItems :
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
        <p className="text-sm text-gray-500">Управление автопарком и ремонтами</p>
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
