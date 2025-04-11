"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Bus, Users, Route, Calendar, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BusTable from "./components/BusTable"
import { busDepotService } from "@/service/busDepotService";


export default function FleetManagerDashboard() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [convoyNumber, setConvoyNumber] = useState<number | null>(null);
  const [busDepotName, setBusDepotName] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  
    const storedConvoyNumber = localStorage.getItem("convoyNumber");
    const storedDepotId = localStorage.getItem("busDepotId");
  
    if (storedConvoyNumber) setConvoyNumber(Number(storedConvoyNumber));
  
    if (storedDepotId) {
      busDepotService.getById(storedDepotId).then(response => {
        if (response.isSuccess && response.value) {
          setBusDepotName(response.value.name);
        }
      }).catch(err => {
        console.error("Ошибка при получении имени автопарка:", err);
      });
    }
  }, []);
  

  // Анимация для карточек
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-sky-700">
          Панель управления {busDepotName ? `автопарком ${busDepotName}` : "автопарком"}
        </h1>
        <p className="text-gray-500">
          Добро пожаловать! Вот обзор состояния вашей колонны
          {convoyNumber !== null && ` №${convoyNumber}`}.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="vehicles">Транспорт</TabsTrigger>
          <TabsTrigger value="drivers">Водители</TabsTrigger>
          <TabsTrigger value="routes">Маршруты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            {/* План выпуска */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    План выпуска
                  </CardTitle>
                  <CardDescription className="text-sky-100">Управление ежедневным выпуском автобусов</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-sky-500" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-sky-500 border-dashed"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    </div>
                  </div>
                  <p className="text-center text-gray-600">Планирование и контроль выпуска автобусов на маршруты</p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/fleet-manager/release-plan" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-sky-50">
                      Перейти к плану выпуска
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Водители */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Водители
                  </CardTitle>
                  <CardDescription className="text-amber-100">Управление персоналом водителей</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
                      <Users className="h-12 w-12 text-amber-500" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-amber-500 border-dashed"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    </div>
                  </div>
                  <p className="text-center text-gray-600">Информация о водителях, графики работы и статусы</p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/fleet-manager/drivers" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-amber-50">
                      Перейти к водителям
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Автобусы */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-6 w-6" />
                    Автобусы
                  </CardTitle>
                  <CardDescription className="text-green-100">Управление автобусным парком</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                      <Bus className="h-12 w-12 text-green-500" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-green-500 border-dashed"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    </div>
                  </div>
                  <p className="text-center text-gray-600">Информация о состоянии и местоположении автобусов</p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/fleet-manager/buses" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-green-50">
                      Перейти к автобусам
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Маршруты */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-6 w-6" />
                    Маршруты
                  </CardTitle>
                  <CardDescription className="text-purple-100">Управление маршрутами движения</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                      <Route className="h-12 w-12 text-purple-500" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-purple-500 border-dashed"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    </div>
                  </div>
                  <p className="text-center text-gray-600">Информация о маршрутах, остановках и расписаниях</p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/fleet-manager/routes" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-purple-50">
                      Перейти к маршрутам
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Справочник */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Справочник
                  </CardTitle>
                  <CardDescription className="text-rose-100">Справочная информация</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-rose-500" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-rose-500 border-dashed"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    </div>
                  </div>
                  <p className="text-center text-gray-600">Справочная информация и документация</p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/fleet-manager/directory" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-rose-50">
                      Перейти к справочнику
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="vehicles">
          <BusTable />
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Управление водителями</CardTitle>
              <CardDescription>Просмотр и управление информацией о водителях</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Здесь будет отображаться список водителей и информация о них.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Управление маршрутами</CardTitle>
              <CardDescription>Просмотр и управление маршрутами движения</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Здесь будет отображаться информация о маршрутах.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

