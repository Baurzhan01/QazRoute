"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BusCard from "./BusCard"; // ✅ подключаем новую карточку!

import type { BusWithDrivers } from "@/types/bus.types";

interface BusListGridProps {
  buses: BusWithDrivers[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  refetchBuses: () => void; // ✅ передаём для обновления автобусов после назначения водителя
}

export default function BusListGrid({
  buses,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  refetchBuses,
}: BusListGridProps) {
  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // 🔥 Автоскролл наверх при смене страницы
  };

  if (buses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Автобусы не найдены</h3>
        <p className="text-gray-500">Попробуйте изменить параметры поиска или фильтрацию</p>
      </div>
    );
  }

  return (
    <>
      {/* Карточки автобусов */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {buses.map((bus) => (
          <BusCard
            key={bus.id}
            bus={bus}
            refetchBuses={refetchBuses}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
