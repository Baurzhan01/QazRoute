"use client";

import { ChevronLeft, ChevronRight, Eye, Edit, UserPlus, BusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { formatShortName } from "../utils/formatShortName";
import type { BusWithDrivers } from "@/types/bus.types";

import { AnimatePresence, motion } from "framer-motion"; // <-- добавляем анимацию

interface BusListProps {
  buses: BusWithDrivers[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAssignDriver: (id: string) => void;
}

export default function BusList({
  buses,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onAssignDriver,
}: BusListProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (buses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Автобусы не найдены</h3>
        <p className="text-gray-500">Попробуйте изменить параметры поиска или добавьте новый автобус</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Гаражный номер</TableHead>
              <TableHead className="w-[180px]">Гос. номер</TableHead>
              <TableHead>Водители</TableHead>
              <TableHead className="w-[150px]">Статус</TableHead>
              <TableHead className="w-[120px] text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence>
              {buses.map((bus) => (
                <motion.tr
                  key={bus.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <BusIcon className="h-5 w-5 text-gray-400" />
                      {bus.garageNumber}
                    </div>
                  </TableCell>
                  <TableCell>{bus.govNumber || "—"}</TableCell>
                  <TableCell>
                    {bus.drivers?.length > 0 ? (
                      <div className="space-y-1">
                        {bus.drivers.map((driver) => (
                          <div key={driver.id}>
                            <span className="font-bold">№ {driver.serviceNumber || "—"}</span>{" "}
                            <span className="text-gray-600">{formatShortName(driver.fullName)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignDriver(bus.id)}
                        className="flex items-center gap-1"
                      >
                        <UserPlus className="h-4 w-4" />
                        Назначить водителя
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bus.busStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onView(bus.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(bus.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* Delete action removed by request */}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>

        </Table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
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
                  onClick={() => onPageChange(page)}
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
