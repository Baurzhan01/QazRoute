"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight } from "lucide-react"
import { useRecentAlerts } from "../hooks"

interface RecentAlertsCardProps {
  isLoaded: boolean
  delay: number
}

export default function RecentAlertsCard({ isLoaded, delay }: RecentAlertsCardProps) {
  const { data, loading } = useRecentAlerts()

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
            <AlertCircle className="h-5 w-5 text-sky-500" />
            Последние оповещения
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-20 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-20 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-20 w-full animate-pulse rounded bg-gray-200"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 rounded-lg border p-3">
                  <AlertCircle
                    className={`h-5 w-5 ${
                      alert.severity === "high"
                        ? "text-red-500"
                        : alert.severity === "medium"
                          ? "text-yellow-500"
                          : "text-blue-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-gray-500">{alert.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            Просмотреть все оповещения
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

