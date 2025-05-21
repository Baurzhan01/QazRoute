"use client";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { releasePlanService } from "@/service/releasePlanService";
import { formatDate } from "../utils/dateUtils";

const colorOptions = ["#000000", "#dc3545", "#28a745", "#007bff", "#ffc107"];

interface InfoCellProps {
  initialValue: string;
  dispatchBusLineId: string;
  date: Date;
}

export function InfoCell({
  initialValue,
  dispatchBusLineId,
  date,
}: InfoCellProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const [textColor, setTextColor] = useState("#000000");
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const handleSave = async () => {
    try {
      await releasePlanService.updateBusLineDescription(
        dispatchBusLineId,
        formatDate(date),
        value.trim()
      );
      toast({ title: "Сохранено", description: "Доп. информация обновлена" });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить" });
    }
  };

  return (
    <div
      className="relative"
      onContextMenu={(e) => {
        e.preventDefault();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        setShowColorMenu(true);
      }}
    >
      <input
        className="w-full text-xs p-1 border rounded outline-none"
        style={{ color: textColor }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
      />

      {showColorMenu && (
        <div
          className="absolute z-50 border bg-white shadow rounded p-1"
          style={{ top: anchorPoint.y, left: anchorPoint.x }}
          onMouseLeave={() => setShowColorMenu(false)}
        >
          {colorOptions.map((color) => (
            <div
              key={color}
              className="w-6 h-6 rounded-full cursor-pointer border mb-1"
              style={{ backgroundColor: color }}
              onClick={() => {
                setTextColor(color);
                setShowColorMenu(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
