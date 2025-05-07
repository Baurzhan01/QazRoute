"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface TimeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
  currentTime: string;
  title?: string;
}

export default function TimeEditModal({
  isOpen,
  onClose,
  onSave,
  currentTime,
  title = "Изменить время",
}: TimeEditModalProps) {
  const [value, setValue] = useState(currentTime);

  useEffect(() => {
    if (isOpen) {
      setValue(currentTime);
    }
  }, [isOpen, currentTime]);

  const handleSave = () => {
    if (!value.match(/^\d{2}:\d{2}$/)) {
      alert("Введите время в формате ЧЧ:ММ");
      return;
    }

    onSave(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Введите время в формате <b>ЧЧ:ММ</b> (например, 08:30 или 16:45)
          </p>

          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="08:00"
            maxLength={5}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
