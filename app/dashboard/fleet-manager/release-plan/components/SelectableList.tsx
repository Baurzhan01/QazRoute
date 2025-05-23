"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check } from "lucide-react";
import React from "react";

type StatusColor = "gray" | "green" | "yellow" | "red";

interface StatusType {
  label: string;
  color?: StatusColor;
}

interface SelectableListProps<T extends { id: string }> {
  items: T[];
  selected: T | null;
  onSelect: (item: T) => void;
  labelKey: keyof T | ((item: T) => string);
  subLabelKey?: keyof T | ((item: T) => string);
  status?: (item: T) => StatusType;
  showConflict?: (item: T) => boolean;
  conflictText?: (item: T) => string | undefined;
  disableItem?: (item: T) => boolean;
}

export default function SelectableList<T extends { id: string }>({
  items,
  selected,
  onSelect,
  labelKey,
  subLabelKey,
  status,
  showConflict,
  conflictText,
  disableItem,
}: SelectableListProps<T>) {
  return (
    <div className="border rounded-md h-48 overflow-y-auto p-2">
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => {
            const isSelected = selected?.id === item.id;
            const label = typeof labelKey === "function" ? labelKey(item) : String(item[labelKey]);
            const subLabel = subLabelKey
              ? typeof subLabelKey === "function"
                ? subLabelKey(item)
                : String(item[subLabelKey])
              : null;

            const itemStatus = status ? status(item) : null;
            const disabled = disableItem?.(item);

            // Выбор цвета для статуса
            const statusColor = itemStatus?.color ?? "gray";

            return (
              <div
                key={item.id}
                className={`p-2 rounded-md flex justify-between items-center transition-colors
                  ${
                    isSelected
                      ? "bg-yellow-50 border border-yellow-200"
                      : disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                onClick={() => !disabled && onSelect(item)}
              >
                <div>
                  <div className={`font-medium ${disabled ? "text-gray-400" : ""}`}>
                    {label}
                  </div>

                  {subLabel && (
                    <div className={`text-sm ${disabled ? "text-gray-400" : "text-gray-600"}`}>
                      {subLabel}
                    </div>
                  )}

                  {itemStatus && (
                    <div className="text-xs mt-1">
                      <Badge
                        variant="outline"
                        className={`${
                          statusColor === "green" && "bg-green-100 text-green-800"
                        } ${
                          statusColor === "yellow" && "bg-yellow-100 text-yellow-800"
                        } ${
                          statusColor === "red" && "bg-red-100 text-red-800"
                        } ${
                          statusColor === "gray" && "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {itemStatus.label}
                      </Badge>
                    </div>
                  )}

                  {showConflict?.(item) && conflictText && (
                    <div className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {conflictText(item)}
                    </div>
                  )}
                </div>

                {isSelected && !disabled && (
                  <Check className="h-4 w-4 text-blue-500" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Нет доступных данных
        </div>
      )}
    </div>
  );
}
