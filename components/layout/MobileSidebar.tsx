"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
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
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [role, setRole] = useState("default")
  const [dashboardPath, setDashboardPath] = useState("/dashboard")

  useEffect(() => {
    const authData = localStorage.getItem("authData")
    if (authData) {
      const user = JSON.parse(authData)
      const roleKey = user.role?.toLowerCase()
      setRole(roleKey || "default")
      setDashboardPath(`/dashboard/${user.role.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`)
    }
  }, [])

  const ctsNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/cts", icon: <Home className="h-5 w-5" /> },
    { title: "Разнарядка", href: "/dashboard/cts/release-plan", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Плановый ремонт", href: "/dashboard/cts/repairs/plan", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Неплановый ремонт", href: "/dashboard/cts/repairs/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Прочий ремонт", href: "/dashboard/cts/repairs/other-repairs", icon: <AlertCircle className="h-5 w-5" /> },
    { title: "Длительный ремонт", href: "/dashboard/cts/long-repairs", icon: <Clock className="h-5 w-5" /> },
    { title: "Сообщения", href: "/dashboard/cts/notifications", icon: <Bell className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ]

  const mccNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mcc", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/mcc/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/mcc/profile", icon: <UserCircle className="h-5 w-5" /> },
  ]

  const dispatcherNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/dispatcher", icon: <Home className="h-5 w-5" /> },
    { title: "План выпуска", href: "/dashboard/dispatcher/release-plan", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Ведомость", href: "/dashboard/dispatcher/final-dispatch", icon: <FileText className="h-5 w-5" /> },
    { title: "Сходы с слиний", href: "/dashboard/dispatcher/departures-drop", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Плановый ремонт", href: "/dashboard/dispatcher/maintenance-plan", icon: <Wrench className="h-5 w-5" /> },
    { title: "Отчеты", href: "/dashboard/dispatcher/reports", icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ]

  const defaultNavItems: NavItem[] = [
    { title: "Панель управления", href: dashboardPath, icon: <Home className="h-5 w-5" /> },
    { title: "Список автобусов", href: "/dashboard/fleet-manager/buses", icon: <Truck className="h-5 w-5" /> },
    { title: "Сходы с линии", href: "/dashboard/breakdowns", icon: <AlertTriangle className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/repairs", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Отчёты", href: "/dashboard/fleet-manager/reports", icon: <FileText className="h-5 w-5" /> },
    { title: "Настройки", href: `${dashboardPath}/settings`, icon: <Settings className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ]

  const navItems =
    role === "mcc" ? mccNavItems :
    role === "cts" || role === "on-duty-mechanic" ? ctsNavItems :
    role === "dispatcher" ? dispatcherNavItems :
    defaultNavItems

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 bg-background/70 backdrop-blur-md border-none shadow-2xl animate-slide-in"
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/images/logo-qazroute.png" alt="QazRoute" className="h-6 w-auto" />
            <span className="font-bold">Автобусный парк</span>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="grid gap-1 p-4">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-md"
                  : "hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
