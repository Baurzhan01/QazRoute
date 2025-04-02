"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Route } from "@/types/route.types";
import RouteCard from "./RouteCard";
import { Plus, Search, RouteIcon, Calendar } from "lucide-react";
import { toFrontendStatus, type FrontendRouteStatus } from "../utils/routeStatusUtils";
import { BusLine } from "@/types/busLine.types";

interface RoutesListProps {
  routes: Route[];
  busLines: { [routeId: string]: BusLine[] };
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
  const [activeTab, setActiveTab] = useState<FrontendRouteStatus | "all">("all");

  const filteredRoutes = routes.filter((route) => {
    const frontendStatus = toFrontendStatus(route.routeStatus);
    const matchesSearch =
      route.number && typeof route.number === "string"
        ? route.number.toLowerCase().includes(searchQuery.toLowerCase())
        : false;
    const matchesTab = activeTab === "all" || frontendStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  const routesByStatus: Record<FrontendRouteStatus, Route[]> = {
    Будни: filteredRoutes.filter((r) => toFrontendStatus(r.routeStatus) === "Будни"),
    Суббота: filteredRoutes.filter((r) => toFrontendStatus(r.routeStatus) === "Суббота"),
    Воскресенье: filteredRoutes.filter((r) => toFrontendStatus(r.routeStatus) === "Воскресенье"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Поиск маршрутов..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={onAddRoute}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить маршрут
        </Button>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg border">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Колонна №{convoyNumber}:</span> Отображаются маршруты, назначенные на вашу колонну
        </p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as FrontendRouteStatus | "all")}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Все дни
          </TabsTrigger>
          <TabsTrigger value="Будни" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Будни
          </TabsTrigger>
          <TabsTrigger value="Суббота" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Суббота
          </TabsTrigger>
          <TabsTrigger value="Воскресенье" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Воскресенье
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <RouteIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchQuery ? "Маршруты не найдены" : "Нет маршрутов"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? `По запросу "${searchQuery}" ничего не найдено`
                  : "Добавьте первый маршрут, чтобы начать работу"}
              </p>
              {!searchQuery && (
                <Button onClick={onAddRoute}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить маршрут
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => {
                const routeBusLinesResponse = route.id ? busLines[route.id] || [] : [];
                console.log(`BusLines for route ${route.id}:`, routeBusLinesResponse);
                return (
                  <RouteCard
                    key={route.id}
                    route={route}
                    busLines={routeBusLinesResponse}
                    onEdit={onEditRoute}
                    onView={onViewRoute}
                    onCopy={onCopyRoute}
                    onDelete={onDeleteRoute}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {(["Будни", "Суббота", "Воскресенье"] as FrontendRouteStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            {routesByStatus[status].length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <RouteIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery ? "Маршруты не найдены" : `Нет маршрутов для "${status}"`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `По запросу "${searchQuery}" ничего не найдено`
                    : `Добавьте маршрут для "${status}"`}
                </p>
                {!searchQuery && (
                  <Button onClick={onAddRoute}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить маршрут
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routesByStatus[status].map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    busLines={route.id ? busLines[route.id] || [] : []}
                    onEdit={onEditRoute}
                    onView={onViewRoute}
                    onCopy={onCopyRoute}
                    onDelete={onDeleteRoute}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}