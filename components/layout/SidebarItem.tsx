"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils" // если у тебя нет этой функции, я скину её через минуту

interface SidebarItemProps {
  title: string
  href: string
  icon: React.ReactNode
}

export default function SidebarItem({ title, href, icon }: SidebarItemProps) {
  const pathname = usePathname()

  const isActive = pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sky-100 text-sky-700"
          : "text-muted-foreground hover:bg-muted hover:text-primary"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  )
}
