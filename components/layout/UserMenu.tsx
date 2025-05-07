"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut } from "lucide-react";

interface UserMenuProps {
  user: { fullName: string; role: string; avatar?: string };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={user.avatar} alt={user.fullName} />
        <AvatarFallback>{user.fullName?.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="hidden md:block text-sm">
        <div className="font-semibold">{user.fullName}</div>
        <div className="text-muted-foreground text-xs capitalize">{user.role}</div>
      </div>
      <Button variant="ghost" size="icon" asChild>
        <Link href="/dashboard/profile">
          <LogOut className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
