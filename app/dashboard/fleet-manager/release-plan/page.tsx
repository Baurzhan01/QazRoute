"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Calendar, Sun, Briefcase, Users } from "lucide-react"
import Link from "next/link"

export default function ReleasePlanTypePage() {
  // Анимация для контейнера
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Анимация для карточек
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

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/fleet-manager">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-700">План выпуска</h1>
          <p className="text-gray-500 mt-1">Выберите тип дня для составления плана выпуска</p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
      >
        {/* Карточка для будних дней */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Link href="/dashboard/fleet-manager/release-plan/workdays">
            <Card className="overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-300 hover:border-sky-500">
              <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white pb-12 relative">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-6 w-6" />
                  Будни
                </CardTitle>
                <div className="absolute bottom-0 right-0 p-4">
                  <Calendar className="h-8 w-8 text-white opacity-50" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-6">
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-10 w-10 text-sky-500" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-sky-500 border-dashed"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Рабочие дни</h3>
                  <p className="text-gray-600">План выпуска для будних дней с понедельника по пятницу</p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-sky-50">
                  Составить план
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        {/* Карточка для субботы */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Link href="/dashboard/fleet-manager/release-plan/saturday">
            <Card className="overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-300 hover:border-amber-500">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white pb-12 relative">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-6 w-6" />
                  Суббота
                </CardTitle>
                <div className="absolute bottom-0 right-0 p-4">
                  <Users className="h-8 w-8 text-white opacity-50" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-6">
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-amber-500" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-amber-500 border-dashed"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Субботний день</h3>
                  <p className="text-gray-600">План выпуска для субботы с учетом сниженного пассажиропотока</p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-amber-50">
                  Составить план
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        {/* Карточка для воскресенья */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Link href="/dashboard/fleet-manager/release-plan/sunday">
            <Card className="overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-300 hover:border-green-500">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white pb-12 relative">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sun className="h-6 w-6" />
                  Воскресенье
                </CardTitle>
                <div className="absolute bottom-0 right-0 p-4">
                  <Sun className="h-8 w-8 text-white opacity-50" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-6">
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Sun className="h-10 w-10 text-green-500" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-green-500 border-dashed"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Выходной день</h3>
                  <p className="text-gray-600">План выпуска для воскресенья и праздничных дней</p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-green-50">
                  Составить план
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

