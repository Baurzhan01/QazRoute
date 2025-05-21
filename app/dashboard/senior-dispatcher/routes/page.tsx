// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import type { Route, RouteDayType, RouteStop } from "./types/route.types"
// import { RouteFilters } from "./components/RouteFilters"
// import { RouteList } from "./components/RouteList"
// import { AddRouteDialog } from "./components/AddRouteDialog"
// import { Button } from "@/components/ui/button"
// import { Plus } from "lucide-react"
// import { routeMockService } from "./services/routeMockService"

// export default function RoutesPage() {
//   const router = useRouter()
//   const [routes, setRoutes] = useState<Route[]>([])
//   const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
//   const [selectedDayType, setSelectedDayType] = useState<RouteDayType | null>(null)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     // Имитация загрузки данных
//     const fetchRoutes = async () => {
//       try {
//         const fetchedRoutes = await routeMockService.getRoutes()
//         // Убедимся, что fetchedRoutes - это массив
//         const routesArray = Array.isArray(fetchedRoutes) ? fetchedRoutes : []
//         setRoutes(routesArray)
//         setFilteredRoutes(routesArray)
//       } catch (error) {
//         console.error("Ошибка при загрузке маршрутов:", error)
//         setRoutes([])
//         setFilteredRoutes([])
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchRoutes()
//   }, [])

//   useEffect(() => {
//     // Убедимся, что routes - это массив перед фильтрацией
//     if (!Array.isArray(routes)) {
//       setFilteredRoutes([])
//       return
//     }

//     let filtered = [...routes]

//     if (selectedDayType) {
//       filtered = filtered.filter((route) => route.dayType === selectedDayType)
//     }

//     if (searchQuery) {
//       const query = searchQuery.toLowerCase()
//       filtered = filtered.filter(
//         (route) =>
//           route.routeNumber.toLowerCase().includes(query) ||
//           route.title.toLowerCase().includes(query) ||
//           (route.startPoint && route.startPoint.toLowerCase().includes(query)) ||
//           (route.endPoint && route.endPoint.toLowerCase().includes(query)),
//       )
//     }

//     setFilteredRoutes(filtered)
//   }, [routes, selectedDayType, searchQuery])

//   const handleDayTypeChange = (dayType: RouteDayType | null) => {
//     setSelectedDayType(dayType)
//   }

//   const handleSearchChange = (query: string) => {
//     setSearchQuery(query)
//   }

//   const handleAddRoute = async (route: Omit<Route, "id">, stops: RouteStop[]) => {
//     try {
//       const newRoute = await routeMockService.addRoute(route)
//       // Убедимся, что routes - это массив перед добавлением нового элемента
//       setRoutes((prevRoutes) => (Array.isArray(prevRoutes) ? [...prevRoutes, newRoute] : [newRoute]))

//       // Добавляем остановки для нового маршрута
//       if (stops.length > 0) {
//         // В реальном приложении здесь был бы API-запрос для сохранения остановок
//         console.log("Сохраняем остановки для маршрута:", newRoute.id, stops)
//       }
//     } catch (error) {
//       console.error("Ошибка при добавлении маршрута:", error)
//     }
//   }

//   const handleRouteClick = (routeId: string) => {
//     router.push(`/dashboard/senior-dispatcher/routes/${routeId}`)
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Управление расписанием маршрутов</h1>
//         <Button onClick={() => setIsAddDialogOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Добавить маршрут
//         </Button>
//       </div>

//       <RouteFilters
//         selectedDayType={selectedDayType}
//         searchQuery={searchQuery}
//         onDayTypeChange={handleDayTypeChange}
//         onSearchChange={handleSearchChange}
//       />

//       <div className="mt-6">
//         <RouteList routes={filteredRoutes} isLoading={isLoading} onRouteClick={handleRouteClick} />
//       </div>

//       <AddRouteDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAddRoute={handleAddRoute} />
//     </div>
//   )
// }
