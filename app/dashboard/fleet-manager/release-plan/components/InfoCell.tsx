"use client";

import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { releasePlanService } from "@/service/releasePlanService";
import { formatDate } from "../utils/dateUtils";
import { AlertTriangle, RefreshCcw, XCircle } from "lucide-react";

const colorOptions = ["#000000", "#dc3545", "#28a745", "#007bff", "#ffc107"];

interface InfoCellProps {
  initialValue: string;
  assignmentId: string;
  date: Date;
  type?: "route" | "reserve";
  busId?: string | null;
  driverId?: string | null;
  textClassName?: string;
  readOnly?: boolean;
}

export function InfoCell({
  initialValue,
  assignmentId,
  date,
  type = "route",
  busId = null,
  driverId = null,
  textClassName = "text-red-600 font-semibold text-sm",
  readOnly = false,
}: InfoCellProps) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const handleSave = useCallback(async () => {
    if (!assignmentId || assignmentId === "not-assigned") {
      toast({ title: "Ошибка", description: "Не указан ID назначения.", variant: "destructive" });
      return;
    }

    try {
      const formattedDate = formatDate(date);
      const trimmed = value.trim();

      if (type === "reserve") {
        await releasePlanService.updateReserveDescription(assignmentId, formattedDate, trimmed);
      } else {
        await releasePlanService.updateBusLineDescription(assignmentId, formattedDate, trimmed);
      }

      toast({ title: "Сохранено", description: "Доп. информация обновлена" });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить" });
    }
  }, [assignmentId, date, type, value]);

  const getIcon = () => {
    if (value.includes("❌")) return <XCircle className="w-4 h-4 text-red-600 inline-block mr-1" />;
    if (value.includes("🔄")) return <RefreshCcw className="w-4 h-4 text-blue-600 inline-block mr-1" />;
    if (value.includes("🔁")) return <AlertTriangle className="w-4 h-4 text-yellow-600 inline-block mr-1" />;
    return null;
  };

  const handleBlur = () => {
    setEditing(false);
    if (value.trim() !== initialValue.trim()) {
      void handleSave();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    setShowColorMenu(true);
  };

  if (readOnly && !editing) {
    return (
      <span
        className={`block text-xs px-1 py-0.5 rounded cursor-pointer ${textClassName}`}
        onClick={() => setEditing(true)}
        style={{ color: textColor }}
      >
        {getIcon()}
        {value || "—"}
      </span>
    );
  }

  return (
    <div className="relative" onContextMenu={handleContextMenu}>
      <input
        className={`w-full text-xs px-1 py-1 border rounded outline-none resize-none ${textClassName}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        onBlur={handleBlur}
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

export default InfoCell;