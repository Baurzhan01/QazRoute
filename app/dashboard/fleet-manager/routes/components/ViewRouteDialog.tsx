"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Route } from "@/types/route.types";
import type { BusLine } from "@/types/busLine.types";
import { Calendar, RouteIcon, ListOrdered, Hash } from "lucide-react";
import { toFrontendStatus, getStatusColor } from "../utils/routeStatusUtils";

interface ViewRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: Route | null;
  busLines: BusLine[];
  onEdit: (route: Route) => void;
  onCopy: (route: Route) => void;
}

export default function ViewRouteDialog({
  open,
  onOpenChange,
  route,
  busLines,
  onEdit,
  onCopy,
}: ViewRouteDialogProps) {
  if (!route) return null;

  const frontendStatus = toFrontendStatus(route.routeStatus);
  const statusColor = getStatusColor(frontendStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <RouteIcon className="h-5 w-5" />
              Маршрут №{route.number}
            </DialogTitle>
            <Badge className={statusColor}>{frontendStatus}</Badge>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <ListOrdered className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Порядок в разнорядке</p>
              <p className="text-gray-600">{route.queue}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Hash className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Выходы</p>
              {busLines.length > 0 ? (
                <ul className="text-gray-600">
                  {busLines.map((busLine) => (
                    <li key={busLine.id}>№{busLine.number}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Нет выходов</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Тип дня</p>
              <p className="text-gray-600">{frontendStatus}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
            <Button onClick={() => onEdit(route)}>Редактировать</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}