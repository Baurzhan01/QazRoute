"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { RepairRecord } from "@/types/repair.types";
import { repairService } from "@/service/repairService";

interface EditRepairDialogProps {
  open: boolean;
  onClose: () => void;
  date: string;
  repair: RepairRecord;
  onUpdated: () => void;
}

export default function EditRepairDialog({
  open,
  onClose,
  date,
  repair,
  onUpdated,
}: EditRepairDialogProps) {
  const [description, setDescription] = useState(repair.description);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await repairService.updateRepair(repair.id, {
        driverId: repair.driver.id,
        busId: repair.bus.id,
        description,
      });

      if (result.isSuccess) {
        toast({ title: "Описание обновлено" });
        onUpdated();
        onClose();
      } else {
        toast({ title: "Ошибка", description: result.error || "Не удалось сохранить", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Произошла ошибка при обновлении", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать описание</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm text-gray-600">
          <div>🚌 <b>Автобус:</b> {repair.bus.govNumber} ({repair.bus.garageNumber})</div>
          <div>👨‍🔧 <b>Водитель:</b> {repair.driver.fullName} (№ {repair.driver.serviceNumber})</div>
        </div>

        <Textarea
          className="mt-4"
          placeholder="Введите описание ремонта"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}