// components/BusStatusStats.tsx
"use client";

import { motion } from "framer-motion";
import { Bus, Wrench, AlertTriangle, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusStatsData } from "@/types/bus.types";

interface BusStatusStatsProps {
  stats?: BusStatsData;
  isLoading?: boolean;
  selectedStatus: string | null;
  onStatusSelect: (status: string | null) => void;
}

export default function BusStatusStats({ stats, isLoading, selectedStatus, onStatusSelect }: BusStatusStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    { title: "Всего", value: stats.total, icon: <Bus />, bgColor: "bg-blue-50", textColor: "text-blue-700", status: null },
    { title: "На линии", value: stats.OnWork, icon: <Bus />, bgColor: "bg-green-50", textColor: "text-green-700", status: "OnWork" },
    { title: "На ремонте", value: stats.UnderRepair, icon: <Wrench />, bgColor: "bg-amber-50", textColor: "text-amber-700", status: "UnderRepair" },
    { title: "Длительный ремонт", value: stats.LongTermRepair, icon: <AlertTriangle />, bgColor: "bg-red-50", textColor: "text-red-700", status: "LongTermRepair" },
    { title: "Списан", value: stats.Decommissioned, icon: <XCircle />, bgColor: "bg-gray-50", textColor: "text-gray-700", status: "Decommissioned" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((card, index) => {
        const isSelected = selectedStatus === card.status;
        return (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatusSelect(card.status)}
            className="cursor-pointer"
          >
            <Card className={`${card.bgColor} ${isSelected ? "ring-2 ring-offset-2" : ""}`}>
              <CardContent className="p-4 flex items-center space-x-4">
                <motion.div className="p-2 bg-white rounded-full shadow">
                  {card.icon}
                </motion.div>
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
