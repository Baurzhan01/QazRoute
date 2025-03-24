"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, FileText, Users } from "lucide-react"
import { useUpcomingSchedule } from "../hooks"

interface UpcomingScheduleCardProps {
  isLoaded: boolean
  delay: number
}

export default function UpcomingScheduleCard({ isLoaded, delay }: UpcomingScheduleCardProps) {
  const { data, loading } = useUpcomingSchedule()

  // Helper function to get the right icon
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "clock":
        return <Clock className="h-5 w-5 text-sky-500" />
      case "file":
        return <FileText className="h-5 w-5 text-sky-500" />
      case "users":
        return <Users className="h-5 w-5 text-sky-500" />
      default:
        return <Clock className="h-5 w-5 text-sky-500" />
    }
  }

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
            <Calendar className="h-5 w-5 text-sky-500" />
            Предстоящие события
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
              {data?.map((item) => (
                <div key={item.id} className="flex items-start gap-4 rounded-lg border p-3">
                  {getIcon(item.icon)}
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            Просмотреть полное расписание
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

