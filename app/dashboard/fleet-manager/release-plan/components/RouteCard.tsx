"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bus, ArrowRight } from "lucide-react"

interface RouteCardProps {
  id: string
  number: string
  order: number
  name?: string
  date: string
  dayType: string
  delay?: number
}

export default function RouteCard({ id, number, order, name, date, dayType, delay = 0 }: RouteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col relative">
        <div className="absolute top-2 left-2 w-8 h-8 bg-blue-500 text-white flex items-center justify-center font-bold rounded-md">
          {order}
        </div>

        <CardContent className="flex-grow flex flex-col items-center justify-center p-6 pt-12">
          <div className="rounded-full bg-blue-100 p-4 mb-4">
            <Bus className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-4xl font-bold mb-1">{number}</h3>
          <p className="text-sm uppercase font-medium tracking-wider text-gray-500 mb-2">МАРШРУТ</p>
          {name && <p className="text-sm text-center text-gray-600">{name}</p>}
        </CardContent>

        <CardFooter className="border-t p-4">
          <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/${date}/route/${id}`} className="w-full">
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span>Детали маршрута</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

