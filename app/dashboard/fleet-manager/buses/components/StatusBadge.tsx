// components/StatusBadge.tsx
"use client";

import { cn } from "@/lib/utils";
import { Bus, Wrench, AlertTriangle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BusStatus } from "@/types/bus.types";

interface StatusBadgeProps {
  status: BusStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusInfo = getStatusInfo(status);

  return (
    <Badge
      className={cn(
        "flex items-center gap-1 font-medium",
        statusInfo.bg,
        statusInfo.text
      )}
    >
      <statusInfo.icon className="h-3 w-3" />
      {statusInfo.label}
    </Badge>
  );
}

function getStatusInfo(status: BusStatus) {
  switch (status) {
    case "OnWork":
      return { label: "На линии", icon: Bus, bg: "bg-green-100", text: "text-green-700" };
    case "UnderRepair":
      return { label: "На ремонте", icon: Wrench, bg: "bg-amber-100", text: "text-amber-700" };
    case "LongTermRepair":
      return { label: "Длительный ремонт", icon: AlertTriangle, bg: "bg-red-100", text: "text-red-700" };
    case "DayOff":
      return { label: "Выходной", icon: Clock, bg: "bg-purple-100", text: "text-purple-700" };
    case "Decommissioned":
      return { label: "Списан", icon: XCircle, bg: "bg-gray-100", text: "text-gray-700" };
    default:
      return { label: "Неизвестный статус", icon: Bus, bg: "bg-gray-100", text: "text-gray-700" };
  }
}
