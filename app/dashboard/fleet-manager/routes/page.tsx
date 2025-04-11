"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, RouteIcon } from "lucide-react";
import type { RouteFormData, UserContext } from "./types";
import type { CreateRouteRequest, Route } from "@/types/route.types";
import type { BusLine } from "@/types/busLine.types";
import RoutesList from "./components/RoutesList";
import RouteDialog from "./components/RouteDialog";
import ViewRouteDialog from "./components/ViewRouteDialog";
import CopyRouteDialog from "./components/CopyRouteDialog";
import { routeService } from "@/service/routeService";
import { busLineService } from "@/service/busLineService";
import { FrontendRouteStatus, toBackendStatus } from "./utils/routeStatusUtils";
import { log } from "console";

export default function RoutesPage() {
  const router = useRouter();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [busLines, setBusLines] = useState<{ [routeId: string]: BusLine[] }>({});
  const [loading, setLoading] = useState(true);
  const [isUserContextLoading, setIsUserContextLoading] = useState(true); // Новое состояние для загрузки userContext

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const [userContext, setUserContext] = useState<UserContext>({
    userId: "",
    userName: "",
    convoyId: "",
    convoyNumber: 0,
  });

  // Функция для загрузки маршрутов
  const fetchRoutes = async (convoyId: string) => {
    try {
      setLoading(true);
      const routesResponse = await routeService.getByConvoyId(convoyId);
      if (!routesResponse.isSuccess) {
        throw new Error(routesResponse.error || "Не удалось загрузить маршруты");
      }
  
      const fetchedRoutes = Array.isArray(routesResponse.value) ? routesResponse.value : [];
      // Загружаем busLines для каждого маршрута
      const busLinesMap: { [routeId: string]: BusLine[] } = {};

      for (const route of fetchedRoutes) {
        try {
          const busLinesResponse = await busLineService.getByRouteId(route.id || "");
          if (busLinesResponse.isSuccess && busLinesResponse.value) {
            route.busLines = busLinesResponse.value;
            busLinesMap[route.id || ""] = busLinesResponse.value;
          } else {
            route.busLines = [];
            busLinesMap[route.id || ""] = [];
          }
        } catch (error) {
          console.warn(`⚠️ Не удалось загрузить выходы для маршрута "${route.number}" (id: ${route.id})`, error);
          route.busLines = [];
          busLinesMap[route.id || ""] = [];
        }
      }
      

      setRoutes(fetchedRoutes);
      setBusLines(busLinesMap); // ✅ теперь данные видны в ViewRouteDialog

    
      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные маршрутов",
        variant: "destructive",
      });
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserContextAndFetchData = async () => {
      try {
        // 1. Загружаем данные из localStorage
        const authData = localStorage.getItem("authData");
        if (!authData) {
          router.push("/login");
          return;
        }

        const parsedData = JSON.parse(authData);
        let userData: UserContext;

        if (parsedData.isSuccess && parsedData.value) {
          userData = {
            userId: parsedData.value.id,
            userName: parsedData.value.fullName,
            convoyId: parsedData.value.convoyId,
            convoyNumber: parsedData.value.convoyNumber,
          };
        } else {
          userData = {
            userId: parsedData.id,
            userName: parsedData.fullName,
            convoyId: parsedData.convoyId,
            convoyNumber: parsedData.convoyNumber,
          };
        }

        setUserContext(userData);
        setIsUserContextLoading(false); // Данные userContext загружены

        // 2. Проверяем convoyId и вызываем fetchData
        if (!userData.convoyId) {
          setLoading(false);
          return;
        }

        await fetchRoutes(userData.convoyId);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные маршрутов",
          variant: "destructive",
        });
        setRoutes([]);
      }
    };

    loadUserContextAndFetchData();
  }, [router]); // Зависимость только от router, так как userContext теперь обрабатывается внутри

  const handleAddRoute = async (formData: RouteFormData) => {
    try {
      const checkResponse = await routeService.checkRoute(formData.number, userContext.convoyId);
      if (!checkResponse.isSuccess) {
        throw new Error("Маршрут с таким номером уже существует в этом автобусном парке");
      }
  
      const newRoute = {
        convoyId: userContext.convoyId,
        routeStatus: formData.routeStatus,
        number: formData.number,
        queue: formData.queue,
      };
  
      const routeResponse = await routeService.create(newRoute);
      if (!routeResponse.isSuccess || !routeResponse.value) {
        throw new Error(routeResponse.error || "Не удалось добавить маршрут");
      }
      const createdRouteId = routeResponse.value; 
      // Проверяем, что createdRoute не null и имеет id
      if (!createdRouteId ) {
        throw new Error("Не удалось получить ID созданного маршрута");
      }
  
      const exitNumbers = formData.exitNumbers.split(",").map((num) => num.trim());
      // Создаем массив объектов busLineData в правильном формате
      const busLinesData = exitNumbers.map((number) => ({
        number, // строка, например "3"
        exitTime: "00:00:00", // Формат HH:mm:ss
        endTime: "00:00:00",
        shiftChangeTime: null, // Сервер ожидает строку, а не null
      }));
  
      // Отправляем данные в формате { routeId, busLines }
      const requestData = {
        routeId: createdRouteId, // Передаем только ID маршрута (строку)
        busLines: busLinesData,
      };
      const busLinesResponse = await busLineService.createMultiple(requestData);
      if (!busLinesResponse.isSuccess || !busLinesResponse.value) {
        throw new Error(busLinesResponse.error || "Не удалось создать выходы");
      }

      // После добавления маршрута и выходов делаем новый запрос, чтобы получить актуальные данные
      await fetchRoutes(userContext.convoyId);
      setIsAddDialogOpen(false);
  
      
      toast({
        title: "Успешно",
        description: `Маршрут "${formData.number}" и ${busLinesData.length} выходов успешно добавлены`,
      });
    } catch (error) {
      console.error("Ошибка при добавлении маршрута:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось добавить маршрут",
        variant: "destructive",
      });
    }
  };

  const handleEditRoute = async (formData: RouteFormData) => {
    try {
      if (!selectedRoute || !selectedRoute.id) return;
  
      const updatedRoute = {
        convoyId: userContext.convoyId,
        routeStatus: toBackendStatus(formData.routeStatus as FrontendRouteStatus),
        number: formData.number,
        queue: formData.queue,
        busLineNumbers: formData.exitNumbers.split(",").map((n) => n.trim()),
      };
  
      const response = await routeService.update(selectedRoute.id, updatedRoute);
      if (!response.isSuccess || !response.value) {
        throw new Error(response.error || "Не удалось обновить маршрут");
      }
  
      // ❌ Проблема: не обновляются или теряются выходы (busLines)
      // ✅ Решение: добавить поддержку редактирования выходов маршрута
  
      const oldNumbers = selectedRoute.busLines?.map((line) => line.number.trim()) ?? [];
      const newNumbers = formData.exitNumbers.split(",").map((n) => n.trim());
  
      const added = newNumbers.filter((n) => !oldNumbers.includes(n));
      const removed = oldNumbers.filter((n) => !newNumbers.includes(n));
  
      // Удаляем выходы, которых больше нет
      for (const old of selectedRoute.busLines ?? []) {
        if (removed.includes(old.number)) {
          try {
            if (!selectedRoute?.id) return;
              await busLineService.getByRouteId(selectedRoute.id);
          } catch (err) {
            console.warn("⚠️ Ошибка удаления выхода:", old.number, err);
          }
        }
      }
  
      // Добавляем новые выходы
      for (const number of added) {
        const alreadyExists = selectedRoute.busLines?.some((line) => line.number === number);
        if (alreadyExists) {
          console.warn(`⚠️ Выход с номером "${number}" уже существует. Пропускаем создание.`);
          continue;
        }
      
        const createPayload = {
          number,
          exitTime: "00:00:00",
          endTime: "00:00:00",
          shiftChangeTime: null,
        };
      
        try {
          await busLineService.createMultiple({
            routeId: selectedRoute.id,
            busLines: [createPayload],
          });
        } catch (err) {
          console.warn("⚠️ Ошибка добавления выхода:", number, err);
        }
      }
      await fetchRoutes(userContext.convoyId);
      setIsEditDialogOpen(false);
  
      toast({
        title: "Успешно",
        description: `Маршрут "${formData.number}" успешно обновлен`,
      });
    } catch (error) {
      console.error("Ошибка при редактировании маршрута:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить маршрут",
        variant: "destructive",
      });
    }
  };
  

  const handleCopyRoute = async (route: Route, newRouteStatus: string) => {
    try {
      const copiedRoute = {
        convoyId: route.convoyId,
        routeStatus: newRouteStatus,
        number: route.number,
        queue: route.queue,
      };

      const response = await routeService.create(copiedRoute as CreateRouteRequest);
      if (!response.isSuccess || !response.value) {
        throw new Error(response.error || "Не удалось скопировать маршрут");
      }

      setRoutes((prev) => [...prev, response.value as unknown as Route]);
      setIsCopyDialogOpen(false);

      toast({
        title: "Успешно",
        description: `Маршрут "${route.number}" успешно скопирован с новым статусом`,
      });
    } catch (error) {
      console.error("Ошибка при копировании маршрута:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать маршрут",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    try {
      const response = await routeService.delete(routeId);
      if (!response.isSuccess) {
        throw new Error(response.error || "Не удалось удалить маршрут");
      }

      setRoutes((prev) => prev.filter((route) => route.id !== routeId));
      setBusLines((prev) => {
        const updatedBusLines = { ...prev };
        delete updatedBusLines[routeId];
        return updatedBusLines;
      });

      toast({
        title: "Успешно",
        description: "Маршрут успешно удален",
      });
    } catch (error) {
      console.error("Ошибка при удалении маршрута:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить маршрут",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => setIsAddDialogOpen(true);
  const openEditDialog = (route: Route) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };
  const openViewDialog = (route: Route) => {
    setSelectedRoute(route);
    setIsViewDialogOpen(true);
  };
  const openCopyDialog = (route: Route) => {
    setSelectedRoute(route);
    setIsCopyDialogOpen(true);
  };

  if (isUserContextLoading || loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-12 bg-gray-200 animate-pulse rounded mt-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700">
            Управление маршрутами
          </h1>
          <p className="text-gray-500 mt-1">
            Колонна №{userContext.convoyNumber} - Просмотр и редактирование маршрутов движения
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-purple-500" />
            Маршруты колонны №{userContext.convoyNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RoutesList
            routes={routes}
            busLines={busLines}
            onAddRoute={openAddDialog}
            onEditRoute={openEditDialog}
            onViewRoute={openViewDialog}
            onCopyRoute={openCopyDialog}
            onDeleteRoute={handleDeleteRoute}
            convoyNumber={userContext.convoyNumber}
          />
        </CardContent>
      </Card>

      <RouteDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Добавить маршрут"
        onSubmit={handleAddRoute}
      />

      <RouteDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Редактировать маршрут"
        route={selectedRoute || undefined}
        onSubmit={handleEditRoute}
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
        onCopy={handleCopyRoute}
      />
    </div>
  );
}