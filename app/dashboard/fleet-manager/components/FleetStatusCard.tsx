"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Bus } from "lucide-react"
import { useFleetStatus } from "../hooks"

interface FleetStatusCardProps {
  isLoaded: boolean
  delay: number
}

export default function FleetStatusCard({ isLoaded, delay }: FleetStatusCardProps) {
  const { data, loading } = useFleetStatus()

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
            <Bus className="h-5 w-5 text-sky-500" />
            Статус автопарка
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">В эксплуатации</span>
                  <span className="text-sm font-medium">{data?.operational}%</span>
                </div>
                <Progress value={data?.operational} className="h-2 bg-sky-100" indicatorClassName="bg-sky-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">На техобслуживании</span>
                  <span className="text-sm font-medium">{data?.inMaintenance}%</span>
                </div>
                <Progress
                  value={data?.inMaintenance}
                  className="h-2 bg-yellow-100"
                  indicatorClassName="bg-yellow-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Не в эксплуатации</span>
                  <span className="text-sm font-medium">{data?.outOfService}%</span>
                </div>
                <Progress value={data?.outOfService} className="h-2 bg-red-100" indicatorClassName="bg-red-500" />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            Подробнее
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

