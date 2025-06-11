// app/dashboard/cts/layout.tsx
"use client";

import { ReactNode } from "react";
import SidebarCTS from "./components/sidebar/SidebarCTS";

export default function CTSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarCTS />
      <div className="flex flex-col flex-1">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}