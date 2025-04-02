"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Route } from "../types";
import { toBackendStatus, type FrontendRouteStatus } from "../utils/routeStatusUtils";

interface CopyRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: Route | null;
  onCopy: (route: Route, newRouteStatus: string) => void;
}

export default function CopyRouteDialog({
  open,
  onOpenChange,
  route,
  onCopy,
}: CopyRouteDialogProps) {
  const [newRouteStatus, setNewRouteStatus] = useState<FrontendRouteStatus>("Будни");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (route) {
      onCopy(route, toBackendStatus(newRouteStatus));
      onOpenChange(false);
    }
  };

  if (!route) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Копировать маршрут №{route.number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newRouteStatus">Новый тип дня</Label>
            <Select
              value={newRouteStatus}
              onValueChange={(value) => setNewRouteStatus(value as FrontendRouteStatus)}
            >
              <SelectTrigger id="newRouteStatus">
                <SelectValue placeholder="Выберите тип дня" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Будни">Будни</SelectItem>
                <SelectItem value="Суббота">Суббота</SelectItem>
                <SelectItem value="Воскресенье">Воскресенье</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Копировать</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}