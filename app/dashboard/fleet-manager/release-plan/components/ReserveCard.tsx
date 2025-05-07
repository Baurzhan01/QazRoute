"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersRound, ArrowRight } from "lucide-react"

interface ReserveDriver {
  id: string
  personnelNumber: string
  firstName: string
  lastName: string
  middleName?: string
}

interface ReserveCardProps {
  drivers: ReserveDriver[]
  date: string
  dayType: "workday" | "saturday" | "sunday" | "holiday"
  delay?: number
}

export default function ReserveCard({ drivers, date, dayType, delay = 0 }: ReserveCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden relative">
        {/* Значок "Р" */}
        <div className="absolute top-2 left-2 w-8 h-8 bg-gray-700 text-white flex items-center justify-center font-bold rounded-md">
          Р
        </div>

        {/* Контент карточки */}
        <CardContent className="flex-grow flex flex-col items-center justify-center p-6 pt-12">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <UsersRound className="h-8 w-8 text-gray-700" />
          </div>

          <h3 className="text-4xl font-bold mb-1">Резерв</h3>
          <p className="text-sm uppercase font-medium tracking-wider text-gray-500 mb-2">ВОДИТЕЛИ</p>

          <p className="text-sm text-center text-gray-600">
            {drivers.length > 0
              ? `Водителей в резерве: ${drivers.length}`
              : "Резерв пуст"}
          </p>
        </CardContent>

        {/* Кнопка перехода */}
        <CardFooter className="border-t p-4">
          <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/reserve`} className="w-full">
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span>Детали резерва</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
