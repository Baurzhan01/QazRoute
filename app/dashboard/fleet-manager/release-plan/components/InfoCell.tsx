"use client";

import { useState } from "react";
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
  const [value, setValue] = useState(initialValue ?? "");
  const [editing, setEditing] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const handleSave = async () => {
    if (!assignmentId || assignmentId === "not-assigned") {
      toast({
        title: "Ошибка",
        description: "Невозможно сохранить: не указан ID назначения.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (type === "reserve") {
        await releasePlanService.updateReserveDescription(
          assignmentId,
          formatDate(date),
          value.trim() || ""
        );
        console.log("Updating reserve:", {
          assignmentId,
          date: formatDate(date),
          value: value.trim()
        });
      } else {
        await releasePlanService.updateBusLineDescription(
          assignmentId,
          formatDate(date),
          value.trim() || ""
        );
      }

      toast({ title: "Сохранено", description: "Доп. информация обновлена" });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить" });
    }
  };

  const getIcon = () => {
    if (value.includes("❌")) return <XCircle className="w-4 h-4 text-red-600 inline-block mr-1" />;
    if (value.includes("🔄")) return <RefreshCcw className="w-4 h-4 text-blue-600 inline-block mr-1" />;
    if (value.includes("🔁")) return <AlertTriangle className="w-4 h-4 text-yellow-600 inline-block mr-1" />;
    return null;
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
    <div
      className="relative"
      onContextMenu={(e) => {
        e.preventDefault();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        setShowColorMenu(true);
      }}
    >
      <input
        className={`w-full text-xs px-1 py-1 border rounded outline-none resize-none ${textClassName}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        onBlur={() => {
          setEditing(false)
          if (value.trim() !== initialValue?.trim()) {
            setTimeout(() => handleSave(), 0)
          }
        }}
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