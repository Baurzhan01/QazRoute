"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, FileText, AlertTriangle, Wrench, BarChart2 } from "lucide-react";

export default function QuickLinks() {
  const router = useRouter();

  const links = [
    {
      label: "План выпуска",
      href: "/dashboard/dispatcher/release-plan",
      icon: <ClipboardList className="h-5 w-5 mr-2" />,
    },
    {
      label: "Ведомость",
      href: "/dashboard/dispatcher/final-dispatch",
      icon: <FileText className="h-5 w-5 mr-2" />,
    },
    {
      label: "Сходы с линий",
      href: "/dashboard/dispatcher/departures-drop",
      icon: <AlertTriangle className="h-5 w-5 mr-2" />,
    },
    {
      label: "Плановый ремонт",
      href: "/dashboard/dispatcher/maintenance-plan",
      icon: <Wrench className="h-5 w-5 mr-2" />,
    },
    {
      label: "Отчеты",
      href: "/dashboard/dispatcher/reports",
      icon: <BarChart2 className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link) => (
        <button
          key={link.href}
          onClick={() => router.push(link.href)}
          className="flex items-center p-4 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-left"
        >
          {link.icon}
          <span className="text-sm font-medium text-gray-800">{link.label}</span>
        </button>
      ))}
    </div>
  );
}
