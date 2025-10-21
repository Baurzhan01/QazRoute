import { ReactNode } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { Toaster } from "@/components/ui/toaster"
import Loader from "@/components/ui/Loader"

export async function generateMetadata(): Promise<Metadata> {
  const allHeaders = await headers()
  const pathname = allHeaders.get("x-next-pathname") || "/"
  const segments = pathname.split("/")
  const role = segments.length > 2 ? segments[2] : "dashboard"

  const titles: Record<string, string> = {
    "fleet-manager": "Менеджер автопарка",
    "mechanic": "Механик",
    "senior-dispatcher": "Старший диспетчер",
    "dispatcher": "Диспетчер",
    "on-duty-mechanic": "Дежурный механик",
    "hr": "HR-отдел",
    "payroll": "Зарплата",
    "admin": "Администрирование",
    "dashboard": "Рабочая панель",
  }

  const roleTitle = titles[role] || "Рабочая панель"

  return {
    title: `${roleTitle} | QazRoute`,
    description: "Управление выпуском, транспортом и маршрутами в системе QazRoute.",
    icons: {
      icon: "/favicon.ico",
    },
  }
}

export default function DashboardRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardLayout>
        <Loader />
        {children}
      </DashboardLayout>
      <Toaster />
    </>
  )
}
