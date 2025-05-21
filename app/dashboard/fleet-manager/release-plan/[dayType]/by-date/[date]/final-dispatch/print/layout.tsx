import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Печать разнарядки | QazRoute",
  description: "Версия разнарядки для печати в системе QazRoute",
};

export default function PrintLayout({ children }: { children: ReactNode }) {
  return <>{children}</>; // ⛔️ без DashboardLayout
}
