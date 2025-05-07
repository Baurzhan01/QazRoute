"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { NavItem } from "./NavigationItem";

interface MobileSidebarProps {
  navItems: NavItem[];
}

export function MobileSidebar({ navItems }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
              className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                pathname === item.href
                  ? "bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-md"
                  : "hover:bg-muted hover:text-foreground"
              }`}
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
