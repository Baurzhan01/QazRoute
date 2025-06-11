"use client";

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
} from "lucide-react";
import clsx from "clsx";

const menuItems = [
  { label: "Главная", icon: Home, href: "/dashboard/cts" },
  { label: "Плановый ремонт", icon: ClipboardList, href: "/dashboard/cts/repairs/plan" },
  { label: "Неплановый ремонт", icon: Wrench, href: "/dashboard/cts/unscheduled-repairs" },
  { label: "Прочий ремонт", icon: AlertCircle, href: "/dashboard/cts/other-repairs" },
  { label: "Длительный ремонт", icon: Clock, href: "/dashboard/cts/long-repairs" },
  { label: "Сообщения", icon: Bell, href: "/dashboard/cts/notifications" },
  { label: "Личный кабинет", icon: UserCircle, href: "/dashboard/cts/profile" },
];

export default function SidebarCTS() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r h-screen fixed top-0 left-0 flex flex-col justify-between">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-sky-700 mb-6">QazRoute</h2>
        <nav className="flex flex-col gap-2">
          {menuItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-sky-100 transition-colors",
                pathname === href ? "bg-sky-100 text-sky-700 font-medium" : "text-gray-700"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} QazRoute
      </div>
    </aside>
  );
}
