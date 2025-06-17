"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ClipboardList, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderCardProps {
  dayType: "workday" | "saturday" | "sunday" | "holiday"
  date: string
  delay?: number
}

export default function OrderCard({ date, dayType, delay = 0 }: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden relative">
        {/* Значок "З" */}
        <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold rounded-md">
          З
        </div>

        {/* Контент */}
        <CardContent className="flex-grow flex flex-col items-center justify-center p-6 pt-12">
          <div className="rounded-full bg-blue-100 p-4 mb-4">
            <ClipboardList className="h-8 w-8 text-blue-700" />
          </div>

          <h3 className="text-4xl font-bold mb-1">Заказы</h3>
          <p className="text-sm uppercase font-medium tracking-wider text-blue-600 mb-2">НАЗНАЧЕНИЯ</p>

          <p className="text-sm text-center text-gray-600">Перейти к управлению заказами на дату</p>
        </CardContent>

        {/* Кнопка перехода */}
        <CardFooter className="border-t p-4">
          <Link href={`/dashboard/fleet-manager/release-plan/${dayType}/by-date/${date}/orders`} className="w-full">
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span>Открыть заказы</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
