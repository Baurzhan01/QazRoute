"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  Home,
  ClipboardList,
  Wrench,
  Clock,
  AlertCircle,
  UserCircle,
  Truck,
  AlertTriangle,
  BarChart2,
  FileText,
  Briefcase,
  CalendarCheck,
  Menu,
  Package,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const toRolePath = (role?: string) => role?.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() ?? "default";

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("default");
  const [dashboardPath, setDashboardPath] = useState("/dashboard");

  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (!authData) return;
    const user = JSON.parse(authData);
    const roleKey = user.role?.toLowerCase() || "default";
    setRole(roleKey);
    setDashboardPath(`/dashboard/${toRolePath(user.role)}`);
  }, []);

  const mechanicNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mechanic", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/mechanic/repairs", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Регистры ремонтов", href: "/dashboard/mechanic/repair-registers", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Каталог автобусов", href: "/dashboard/mechanic/buses", icon: <Truck className="h-5 w-5" /> },
    { title: "Выявленные дефекты", href: "/dashboard/mechanic/breakdowns", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

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

  const mccNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mcc", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/mcc/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/mcc/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const lrtNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/lrt", icon: <Home className="h-5 w-5" /> },
    { title: "Выявленные дефекты", href: "/dashboard/lrt/breakdowns", icon: <Wrench className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const otkNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/otk", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал агрегатов", href: "/dashboard/otk/journal", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const guideNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/guide", icon: <Home className="h-5 w-5" /> },
    { title: "Колонны", href: "/dashboard/guide/convoys", icon: <Truck className="h-5 w-5" /> },
    { title: "События", href: "/dashboard/guide/incidents", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Ремонты", href: "/dashboard/guide/repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Регистры ремонтов", href: "/dashboard/guide/repair-registers", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Отчёты", href: "/dashboard/guide/reports", icon: <BarChart2 className="h-5 w-5" /> },
  ];

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

  const defaultNavItems: NavItem[] = [
    { title: "Рабочий стол", href: dashboardPath, icon: <Home className="h-5 w-5 text-sky-500" /> },
    { title: "Каталог автобусов", href: "/dashboard/fleet-manager/buses", icon: <Truck className="h-5 w-5 text-sky-500" /> },
    { title: "Выявленные дефекты", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
    { title: "Журнал ремонтов", href: "/dashboard/repairs", icon: <ClipboardList className="h-5 w-5 text-sky-500" /> },
    { title: "Табель", href: "/dashboard/timesheet", icon: <CalendarCheck className="h-5 w-5 text-sky-500" /> },
    { title: "Отчёты", href: "/dashboard/fleet-manager/reports", icon: <FileText className="h-5 w-5 text-sky-500" /> },
    { title: "Профиль", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5 text-sky-500" /> },
  ];

  const navItems = useMemo(() => {
    if (role === "mechanic") return mechanicNavItems;
    if (role === "mcc") return mccNavItems;
    if (role === "cts" || role === "on-duty-mechanic") return ctsNavItems;
    if (role === "otk") return otkNavItems;
    if (role === "dispatcher") return dispatcherNavItems;
    if (role === "lrt") return lrtNavItems;
    if (role === "guide") return guideNavItems;
    return defaultNavItems;
  }, [role, dashboardPath]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 border-none bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/images/logo-qazroute.png" alt="QazRoute" className="h-6 w-auto" />
            <span className="font-semibold text-sm">QazRoute ERP</span>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="grid gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition",
                pathname === item.href ? "bg-sky-500 text-white shadow" : "hover:bg-muted"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
