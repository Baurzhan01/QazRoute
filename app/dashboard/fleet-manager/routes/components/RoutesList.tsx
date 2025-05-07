"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, RouteIcon } from "lucide-react";
import RouteCard from "./RouteCard";
import type { Route } from "@/types/route.types";
import type { BusLine } from "@/types/busLine.types";

interface RoutesListProps {
  routes: Route[];
  busLines: Record<string, BusLine[]>;
  onAddRoute: () => void;
  onEditRoute: (route: Route) => void;
  onViewRoute: (route: Route) => void;
  onCopyRoute: (route: Route) => void;
  onDeleteRoute: (routeId: string) => void;
  convoyNumber: number;
}

export default function RoutesList({
  routes,
  busLines,
  onAddRoute,
  onEditRoute,
  onViewRoute,
  onCopyRoute,
  onDeleteRoute,
  convoyNumber,
}: RoutesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return routes;
    return routes.filter((route) =>
      route.number.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [routes, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Поиск и кнопка "Добавить" */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Поиск по номеру маршрута..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={onAddRoute}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить маршрут
        </Button>
      </div>

      {/* Информация о колонне */}
      <div className="bg-gray-50 p-3 rounded-lg border">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Колонна №{convoyNumber}:</span> отображаются маршруты, закреплённые за вашей колонной
        </p>
      </div>

      {/* Список маршрутов */}
      {filteredRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg bg-gray-50 text-center animate-fadeIn">
          <RouteIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-bold mb-2">
            {searchQuery ? "Маршруты не найдены" : "Нет маршрутов"}
          </h2>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? `По запросу "${searchQuery}" ничего не найдено`
              : "Добавьте новый маршрут для начала работы"}
          </p>
          {!searchQuery && (
            <Button onClick={onAddRoute}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить маршрут
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              busLines={busLines[route.id || ""] || []}
              onEdit={onEditRoute}
              onView={onViewRoute}
              onCopy={onCopyRoute}
              onDelete={onDeleteRoute}
            />
          ))}
        </div>
      )}
    </div>
  );
}
