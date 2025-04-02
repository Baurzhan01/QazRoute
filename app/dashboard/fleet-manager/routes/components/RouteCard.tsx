"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RouteIcon, Edit, Eye, Copy, Trash } from "lucide-react";
import type { Route } from "@/types/route.types";
import type { BusLine } from "@/types/busLine.types";
import { toFrontendStatus, getStatusColor, getStatusGradient } from "../utils/routeStatusUtils";

interface RouteCardProps {
  route: Route;
  busLines: BusLine[];
  onEdit: (route: Route) => void;
  onView: (route: Route) => void;
  onCopy: (route: Route) => void;
  onDelete: (routeId: string) => void;
}

export default function RouteCard({
  route,
  busLines,
  onEdit,
  onView,
  onCopy,
  onDelete,
}: RouteCardProps) {
  const frontendStatus = toFrontendStatus(route.routeStatus);
  const statusGradient = getStatusGradient(frontendStatus);
  const statusColor = getStatusColor(frontendStatus);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className={`bg-gradient-to-r ${statusGradient} text-white`}>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5" />
            Маршрут №{route.number}
          </CardTitle>
          <Badge className={statusColor}>{frontendStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Порядок в разнорядке:</p>
            <p className="font-medium">{route.queue}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Выходы:</p>
            <p className="font-medium">{busLines.length}</p>
          </div>
        </div>
      </CardContent>
      <CardContent className="border-t pt-3 flex justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(route)}>
            <Eye className="mr-2 h-4 w-4" />
            Просмотр
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(route)}>
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => route.id && onDelete(route.id)}
            className="text-red-500 hover:text-red-700">
            <Trash className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}