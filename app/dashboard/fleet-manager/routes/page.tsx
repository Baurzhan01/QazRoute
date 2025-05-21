"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route, RouteStatus } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, RouteIcon, Calendar, CalendarDays, CalendarCheck2, CalendarX2 } from "lucide-react";
// остальные импорты

import RoutesList from "./components/RoutesList";
import RouteDialog from "./components/RouteDialog";
import ViewRouteDialog from "./components/ViewRouteDialog";
import CopyRouteDialog from "./components/CopyRouteDialog";
import { routeService } from "@/service/routeService";
import { busLineService } from "@/service/busLineService";
import type { RouteFormData, UserContext } from "./types";
import type { BusLine } from "@/types/busLine.types";
import { FrontendRouteStatus, toBackendStatus, toFrontendStatus } from "./utils/routeStatusUtils";

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [busLines, setBusLines] = useState<Record<string, BusLine[]>>({});
  const [loading, setLoading] = useState(true);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FrontendRouteStatus | "Все">("Все");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (!authData) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(authData);
    const user: UserContext = {
      userId: parsed.id || parsed.value?.id,
      userName: parsed.fullName || parsed.value?.fullName,
      convoyId: parsed.convoyId || parsed.value?.convoyId,
      convoyNumber: parsed.convoyNumber || parsed.value?.convoyNumber,
    };
    setUserContext(user);
  }, [router]);

  useEffect(() => {
    if (userContext?.convoyId) {
      fetchRoutes();
    }
  }, [userContext, selectedFilter]);

  const fetchRoutes = async () => {
    if (!userContext) return;
    setLoading(true);
    try {
      const statusParam = selectedFilter === "Все" ? undefined : toBackendStatus(selectedFilter);
      const response = await routeService.getByConvoyId(userContext.convoyId, statusParam);

      if (!response.isSuccess || !response.value) throw new Error(response.error || "Ошибка получения маршрутов");

      const fetched = response.value;
      const busLinesMap: Record<string, BusLine[]> = {};
      await Promise.all(
        fetched.map(async (route) => {
          try {
            const busLinesRes = await busLineService.getByRouteId(route.id || "");
            busLinesMap[route.id || ""] = busLinesRes.isSuccess && busLinesRes.value ? busLinesRes.value : [];
          } catch {
            busLinesMap[route.id || ""] = [];
          }
        })
      );

      setRoutes(fetched);
      setBusLines(busLinesMap);
    } catch (error) {
      console.error(error);
      toast({ title: "Ошибка", description: "Не удалось загрузить маршруты", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => setIsAddDialogOpen(true);
  const openEditDialog = (route: Route) => { setSelectedRoute(route); setIsEditDialogOpen(true); };
  const openViewDialog = (route: Route) => { setSelectedRoute(route); setIsViewDialogOpen(true); };
  const openCopyDialog = (route: Route) => { setSelectedRoute(route); setIsCopyDialogOpen(true); };

  const filteredRoutes = selectedFilter === "Все"
    ? routes
    : routes.filter(route => toFrontendStatus(route.routeStatus) === selectedFilter);

  if (!userContext || loading) {
    return <div className="flex justify-center items-center min-h-[400px] text-muted-foreground">Загрузка маршрутов...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      {/* заголовок */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Управление маршрутами</h1>
          <p className="text-muted-foreground">Колонна №{userContext.convoyNumber}</p>
        </div>
      </div>

      {/* фильтры */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["Все", "Будни", "Суббота", "Воскресенье"] as (FrontendRouteStatus | "Все")[]).map((filter) => (
          <Button key={filter} onClick={() => setSelectedFilter(filter)}>
            {filter}
          </Button>
        ))}
      </div>

      {/* список маршрутов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-primary" />
            Маршруты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RoutesList
            routes={filteredRoutes}
            busLines={busLines}
            onAddRoute={openAddDialog}
            onEditRoute={openEditDialog}
            onViewRoute={openViewDialog}
            onCopyRoute={openCopyDialog}
            onDeleteRoute={async (id) => {
              await routeService.delete(id);
              await fetchRoutes();
            }}
            convoyNumber={userContext.convoyNumber}
          />
        </CardContent>
      </Card>

      {/* диалоги */}
      <RouteDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Добавить маршрут"
        onSubmit={async (formData) => {
          if (!userContext?.convoyId) return;

          setIsSaving(true);
          try {
            const created = await routeService.create({
              convoyId: userContext.convoyId,
              routeStatus: formData.routeStatus,
              number: formData.number,
              queue: formData.queue,
            });

            if (!created.isSuccess || !created.value) {
              toast({
                title: "Ошибка",
                description: created.error || "Не удалось создать маршрут",
                variant: "destructive",
              });
              return;
            }

            if (formData.exitNumbers.trim()) {
              const exits = formData.exitNumbers.split(",").map((n) => n.trim());
              const busLineRes = await busLineService.createMultiple({
                routeId: created.value,
                busLines: exits.map(number => ({
                  number,
                  exitTime: "00:00:00",
                  endTime: "00:00:00",
                  shiftChangeTime: null,
                })),
              });

              if (!busLineRes.isSuccess) {
                toast({
                  title: "Ошибка при создании выходов",
                  description: busLineRes.error || "Выходы не были добавлены",
                  variant: "destructive",
                });
              }
            }

            toast({ title: "Маршрут успешно добавлен" });
            await fetchRoutes();
            setIsAddDialogOpen(false);
          } catch (error) {
            toast({
              title: "Непредвиденная ошибка",
              description: String(error),
              variant: "destructive",
            });
          } finally {
            setIsSaving(false);
          }
        }}
      />
      <RouteDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Редактировать маршрут"
        route={selectedRoute || undefined}
        onSubmit={async (formData) => {
          if (!selectedRoute?.id || !userContext?.convoyId) return;

          setIsSaving(true);
          try {
            const exits = formData.exitNumbers.split(",").map((n) => n.trim());
            const updated = await routeService.update(selectedRoute.id, {
              convoyId: userContext.convoyId,
              routeStatus: formData.routeStatus,
              number: formData.number,
              queue: formData.queue,
              busLineNumbers: exits,
            });

            if (!updated.isSuccess) {
              toast({
                title: "Ошибка обновления маршрута",
                description: updated.error || "Не удалось обновить маршрут",
                variant: "destructive",
              });
              return;
            }

            toast({ title: "Маршрут успешно обновлён" });
            await fetchRoutes();
            setIsEditDialogOpen(false);
          } catch (error) {
            toast({
              title: "Непредвиденная ошибка",
              description: String(error),
              variant: "destructive",
            });
          } finally {
            setIsSaving(false);
          }
        }}
      />
      <ViewRouteDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        route={selectedRoute}
        busLines={selectedRoute?.id ? busLines[selectedRoute.id] || [] : []}
        onEdit={openEditDialog}
        onCopy={openCopyDialog}
      />

      <CopyRouteDialog
        open={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        route={selectedRoute}
        onCopy={async (routeToCopy, newStatus) => {
          if (!routeToCopy) return;
          await routeService.create({
            convoyId: routeToCopy.convoyId,
            routeStatus: routeToCopy.routeStatus,
            number: routeToCopy.number,
            queue: routeToCopy.queue,
          });
          await fetchRoutes();
          setIsCopyDialogOpen(false);
          toast({ title: "Маршрут скопирован" });
        }}
      />
    </div>
  );
}
