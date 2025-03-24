"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertCircle,
  BarChart3,
  Bus,
  Calendar,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  Wrench,
} from "lucide-react"

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Extract role from pathname
  const pathSegments = pathname.split("/")
  const role = pathSegments.length > 2 ? pathSegments[2] : "default"

  // Get navigation items based on role
  const navItems = getNavItemsByRole(role)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Переключить меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b px-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src="/images/logo-qazroute.png" alt="QAZROUTE" className="h-6 w-auto" />
                    <span className="font-bold">Управление автобусным парком</span>
                  </Link>
                </div>
                <nav className="grid gap-1 p-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        pathname === item.href ? "bg-sky-100 text-sky-700" : "hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logo-qazroute.png" alt="QAZROUTE" className="h-20 w-auto" />
              <span className="font-bold hidden md:inline-block">Управление автобусным парком</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <AlertCircle className="h-5 w-5" />
              <span className="sr-only">Уведомления</span>
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Сообщения</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Настройки</span>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Выход</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        <aside className="hidden w-64 flex-col border-r bg-white md:flex">
          <nav className="grid gap-1 p-4">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === item.href ? "bg-sky-100 text-sky-700" : "hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

function getNavItemsByRole(role) {
  // Common navigation items for all roles
  const commonItems = [
    {
      title: "Панель управления",
      href: `/dashboard/${role}`,
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Настройки",
      href: `/dashboard/${role}/settings`,
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  // Role-specific navigation items
  const roleSpecificItems = {
    "fleet-manager": [
      {
        title: "Обзор автопарка",
        href: `/dashboard/${role}/fleet`,
        icon: <Bus className="h-5 w-5" />,
      },
      {
        title: "Аналитика",
        href: `/dashboard/${role}/analytics`,
        icon: <BarChart3 className="h-5 w-5" />,
      },
      {
        title: "Отчеты",
        href: `/dashboard/${role}/reports`,
        icon: <FileText className="h-5 w-5" />,
      },
    ],
    mechanic: [
      {
        title: "Техобслуживание",
        href: `/dashboard/${role}/maintenance`,
        icon: <Wrench className="h-5 w-5" />,
      },
      {
        title: "График обслуживания",
        href: `/dashboard/${role}/schedule`,
        icon: <Calendar className="h-5 w-5" />,
      },
    ],
    "senior-dispatcher": [
      {
        title: "Планирование маршрутов",
        href: `/dashboard/${role}/routes`,
        icon: <Bus className="h-5 w-5" />,
      },
      {
        title: "Расписание",
        href: `/dashboard/${role}/schedule`,
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        title: "Команда диспетчеров",
        href: `/dashboard/${role}/team`,
        icon: <Users className="h-5 w-5" />,
      },
    ],
    dispatcher: [
      {
        title: "Ежедневные маршруты",
        href: `/dashboard/${role}/routes`,
        icon: <Bus className="h-5 w-5" />,
      },
      {
        title: "Расписание",
        href: `/dashboard/${role}/schedule`,
        icon: <Clock className="h-5 w-5" />,
      },
    ],
    "on-duty-mechanic": [
      {
        title: "Экстренный ремонт",
        href: `/dashboard/${role}/emergency`,
        icon: <AlertCircle className="h-5 w-5" />,
      },
      {
        title: "Журнал техобслуживания",
        href: `/dashboard/${role}/log`,
        icon: <FileText className="h-5 w-5" />,
      },
    ],
    hr: [
      {
        title: "Сотрудники",
        href: `/dashboard/${role}/employees`,
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: "Посещаемость",
        href: `/dashboard/${role}/attendance`,
        icon: <Clock className="h-5 w-5" />,
      },
      {
        title: "Обучение",
        href: `/dashboard/${role}/training`,
        icon: <FileText className="h-5 w-5" />,
      },
    ],
    payroll: [
      {
        title: "Расчет зарплаты",
        href: `/dashboard/${role}/salary`,
        icon: <BarChart3 className="h-5 w-5" />,
      },
      {
        title: "Отчеты",
        href: `/dashboard/${role}/reports`,
        icon: <FileText className="h-5 w-5" />,
      },
    ],
    default: [
      {
        title: "Обзор",
        href: "/dashboard",
        icon: <Home className="h-5 w-5" />,
      },
    ],
  }

  // Return combined navigation items
  return [...commonItems, ...(roleSpecificItems[role] || roleSpecificItems["default"])]
}

