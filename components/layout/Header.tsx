"use client"

import { useEffect, useState } from "react"
import { Clock, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import Link from "next/link"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { usePathname } from "next/navigation"
import { Home, Wrench, UserCircle } from "lucide-react"
import type { NavItem } from "./NavigationItem"

function formatRole(role: string | undefined) {
  if (!role) return "Пользователь"
  return role.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()
}

function getProfileLink(role?: string) {
  return "/dashboard/profile"
}

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const authData = localStorage.getItem("authData")
    if (authData) {
      const parsed = JSON.parse(authData)
      setUser({ fullName: parsed.fullName, role: parsed.role })
    }
  }, [])

  const role = user?.role?.toLowerCase()
  const isMCC = role === "mcc"

  const mccNavItems: NavItem[] = [
    { title: "Главная", href: "/dashboard/mcc", icon: <Home className="h-5 w-5" /> },
    { title: "Журнал ремонтов", href: "/dashboard/mcc/unscheduled-repairs", icon: <Wrench className="h-5 w-5" /> },
    { title: "Личный кабинет", href: "/dashboard/mcc/profile", icon: <UserCircle className="h-5 w-5" /> },
  ]

  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <MobileSidebar navItems={isMCC ? mccNavItems : []} />
        </div>

        <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-500" title={user?.fullName ?? "Гость"}>
          <User className="h-5 w-5" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium">{user?.fullName ?? "Гость"}</p>
          <p className="text-xs text-gray-500 capitalize">{formatRole(user?.role)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-gray-500">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {format(currentTime, "d MMMM yyyy, HH:mm", { locale: ru })}
          </span>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href={getProfileLink(user?.role)}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Личный кабинет</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
          asChild
        >
          <Link href="/login">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Выход</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
