"use client";

import { ReactNode } from "react";
import {
  AlertCircle,
  BarChart3,
  Bus,
  Calendar,
  Clock,
  FileText,
  Home,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
}

type Role =
  | "fleet-manager"
  | "mechanic"
  | "senior-dispatcher"
  | "dispatcher"
  | "on-duty-mechanic"
  | "hr"
  | "payroll"
  | "default";

const roleNavItems: Record<Role, NavItem[]> = {
  "fleet-manager": [
    { title: "Обзор автопарка", href: "/dashboard/fleet-manager/fleet", icon: <Bus className="h-5 w-5" /> },
    { title: "Аналитика", href: "/dashboard/fleet-manager/analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { title: "Отчеты", href: "/dashboard/fleet-manager/reports", icon: <FileText className="h-5 w-5" /> },
  ],
  mechanic: [
    { title: "Техобслуживание", href: "/dashboard/mechanic/maintenance", icon: <Wrench className="h-5 w-5" /> },
    { title: "График обслуживания", href: "/dashboard/mechanic/schedule", icon: <Calendar className="h-5 w-5" /> },
  ],
  "senior-dispatcher": [
    { title: "Планирование маршрутов", href: "/dashboard/senior-dispatcher/routes", icon: <Bus className="h-5 w-5" /> },
    { title: "Расписание", href: "/dashboard/senior-dispatcher/schedule", icon: <Calendar className="h-5 w-5" /> },
    { title: "Команда диспетчеров", href: "/dashboard/senior-dispatcher/team", icon: <Users className="h-5 w-5" /> },
  ],
  dispatcher: [
    { title: "Ежедневные маршруты", href: "/dashboard/dispatcher/routes", icon: <Bus className="h-5 w-5" /> },
    { title: "Расписание", href: "/dashboard/dispatcher/schedule", icon: <Clock className="h-5 w-5" /> },
  ],
  "on-duty-mechanic": [
    { title: "Экстренный ремонт", href: "/dashboard/on-duty-mechanic/emergency", icon: <AlertCircle className="h-5 w-5" /> },
    { title: "Журнал ТО", href: "/dashboard/on-duty-mechanic/log", icon: <FileText className="h-5 w-5" /> },
  ],
  hr: [
    { title: "Сотрудники", href: "/dashboard/hr/employees", icon: <Users className="h-5 w-5" /> },
    { title: "Посещаемость", href: "/dashboard/hr/attendance", icon: <Clock className="h-5 w-5" /> },
    { title: "Обучение", href: "/dashboard/hr/training", icon: <FileText className="h-5 w-5" /> },
  ],
  payroll: [
    { title: "Расчет зарплаты", href: "/dashboard/payroll/salary", icon: <BarChart3 className="h-5 w-5" /> },
    { title: "Отчеты", href: "/dashboard/payroll/reports", icon: <FileText className="h-5 w-5" /> },
  ],
  default: [
    { title: "Главная", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
  ],
};

export function getNavItemsByRole(role: string): NavItem[] {
  const profileItem = { title: "Личный кабинет", href: `/dashboard/${role}/profile`, icon: <Users className="h-5 w-5" /> };

  const baseItems: NavItem[] = [
    { title: "Панель управления", href: `/dashboard/${role}`, icon: <Home className="h-5 w-5" /> },
    profileItem,
    { title: "Настройки", href: `/dashboard/${role}/settings`, icon: <Settings className="h-5 w-5" /> },
  ];

  if (role in roleNavItems) {
    return [...baseItems, ...roleNavItems[role as Role]];
  }

  return [...baseItems, ...roleNavItems["default"]];
}
