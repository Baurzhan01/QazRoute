"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, RouteIcon, ListOrdered, Hash } from "lucide-react";
import { toFrontendStatus, getStatusColor } from "../utils/routeStatusUtils";
import type { Route } from "@/types/route.types";
import type { BusLine } from "@/types/busLine.types";

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
      <DialogContent className="sm:max-w-[500px] animate-fadeIn">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2 text-primary">
              <RouteIcon className="h-6 w-6" />
              Маршрут №{route.number}
            </DialogTitle>
            <Badge className={statusColor}>{frontendStatus}</Badge>
          </div>
        </DialogHeader>

        {/* Основной контент */}
        <div className="space-y-6 py-6">
          <InfoBlock
            icon={<ListOrdered className="h-5 w-5 text-muted-foreground" />}
            title="Порядок в разнорядке"
            content={route.queue.toString()}
          />
          <InfoBlock
            icon={<Hash className="h-5 w-5 text-muted-foreground" />}
            title="Выходы"
            content={
              busLines.length > 0 ? (
                <ul className="text-muted-foreground list-disc list-inside">
                  {busLines.map((busLine) => (
                    <li key={busLine.id}>Выход №{busLine.number}</li>
                  ))}
                </ul>
              ) : (
                "Нет выходов"
              )
            }
          />
          <InfoBlock
            icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
            title="Тип дня"
            content={frontendStatus}
          />
        </div>

        {/* Действия */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onCopy(route)}>
              Копировать
            </Button>
            <Button onClick={() => onEdit(route)}>Редактировать</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Маленький компонент для аккуратных блоков информации
function InfoBlock({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="font-semibold">{title}</p>
        <div className="text-muted-foreground">{content}</div>
      </div>
    </div>
  );
}
