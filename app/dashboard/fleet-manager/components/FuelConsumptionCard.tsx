"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Fuel } from "lucide-react"
import { useFuelConsumption } from "../hooks"

interface FuelConsumptionCardProps {
  isLoaded: boolean
  delay: number
}

export default function FuelConsumptionCard({ isLoaded, delay }: FuelConsumptionCardProps) {
  const { data, loading } = useFuelConsumption()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isLoaded ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-sky-500" />
            Расход топлива
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Этот месяц</p>
                  <p className="text-2xl font-bold">{data?.thisMonth.toLocaleString()} Л</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Прошлый месяц</p>
                  <p className="text-2xl font-bold">{data?.lastMonth.toLocaleString()} Л</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Эффективность</span>
                  <span className="text-sm font-medium text-green-600">+{data?.efficiency}%</span>
                </div>
                <Progress value={75} className="h-2 bg-sky-100" indicatorClassName="bg-sky-500" />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            Просмотреть отчет о расходе
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

