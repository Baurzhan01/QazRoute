import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const allHeaders = await headers(); // <-- добавили await!
  const pathname = allHeaders.get("x-next-pathname") || "/";
  const segments = pathname.split("/");
  const role = segments.length > 2 ? segments[2] : "dashboard";

  const titles: Record<string, string> = {
    "fleet-manager": "Менеджер автопарка",
    "mechanic": "Механик",
    "senior-dispatcher": "Старший диспетчер",
    "dispatcher": "Диспетчер",
    "on-duty-mechanic": "Дежурный механик",
    "hr": "HR-отдел",
    "payroll": "Бухгалтерия",
    "admin": "Администратор",
    "dashboard": "Панель управления",
  };

  const roleTitle = titles[role] || "Панель управления";

  return {
    title: `${roleTitle} | QazRoute`,
    description: "Управление маршрутами, автобусами и сотрудниками автобусного парка через систему QazRoute.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default function DashboardRootLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
