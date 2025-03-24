"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bus, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import type { Route } from "@/app/api/types"

interface RouteCardProps {
  route: Route
  orderNumber: number
  dayType?: string
}

export default function RouteCard({ route, orderNumber, dayType = "workdays" }: RouteCardProps) {
  // Анимация для карточки
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 },
    },
  }

  // Генерация цвета фона в зависимости от типа дня
  const getBackgroundGradient = () => {
    switch (dayType) {
      case "workdays":
        return "from-blue-500 to-blue-600"
      case "saturday":
        return "from-amber-500 to-amber-600"
      case "sunday":
        return "from-green-500 to-green-600"
      default:
        return "from-blue-500 to-blue-600"
    }
  }

  const backgroundGradient = getBackgroundGradient()

  return (
    <motion.div variants={cardVariants} whileHover="hover">
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className={`bg-gradient-to-r ${backgroundGradient} text-white relative pb-12`}>
          <div className="absolute top-2 right-2 bg-white bg-opacity-20 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center">
            {orderNumber}
          </div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bus className="h-6 w-6" />
            Маршрут №{route.number}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pt-4 relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-blue-600">{route.number}</span>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="15" width="90" height="30" rx="5" fill="#3B82F6" />
                  <rect x="10" y="20" width="15" height="10" rx="2" fill="#DBEAFE" />
                  <rect x="75" y="20" width="15" height="10" rx="2" fill="#DBEAFE" />
                  <rect x="10" y="35" width="15" height="5" rx="2" fill="#1E3A8A" />
                  <rect x="75" y="35" width="15" height="5" rx="2" fill="#1E3A8A" />
                  <rect x="30" y="20" width="40" height="15" rx="2" fill="#DBEAFE" />
                </svg>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" }}
                >
                  <svg
                    width="100"
                    height="60"
                    viewBox="0 0 100 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ position: "absolute" }}
                  >
                    <circle cx="25" cy="45" r="5" fill="#1E3A8A" />
                    <circle cx="75" cy="45" r="5" fill="#1E3A8A" />
                  </svg>
                </motion.div>
              </div>
            </div>
            <p className="text-center text-gray-600">Нажмите для управления выпуском автобусов на этот маршрут</p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/${route.id}`} className="w-full">
            <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-blue-50">
              Управление выпуском
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

