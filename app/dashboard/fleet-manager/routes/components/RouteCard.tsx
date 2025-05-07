"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Copy, Trash, RouteIcon } from "lucide-react";
import type { Route } from "@/types/route.types";
import type { BusLine } from "@/types/busLine.types";
import { getStatusGradient, getStatusColor, toFrontendStatus } from "../utils/routeStatusUtils";

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
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      {/* Верхняя часть с цветной плашкой */}
      <CardHeader
        className={`bg-gradient-to-r ${statusGradient} text-white flex flex-col gap-2`}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <RouteIcon className="h-5 w-5" />
            Маршрут №{route.number}
          </CardTitle>
          <Badge className={statusColor}>{frontendStatus}</Badge>
        </div>
      </CardHeader>

      {/* Основная информация */}
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Порядок в разнорядке:</p>
            <p className="font-semibold">{route.queue}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Количество выходов:</p>
            <p className="font-semibold">{busLines.length}</p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(route)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Просмотр
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(route)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onCopy(route)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Копировать
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => route.id && onDelete(route.id)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Удалить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
