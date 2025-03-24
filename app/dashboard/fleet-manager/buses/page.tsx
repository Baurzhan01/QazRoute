"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import BusTable from "../components/BusTable"
import { motion } from "framer-motion"

export default function BusesPage() {
  const [isLoaded, setIsLoaded] = useState(true)

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard/fleet-manager">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-sky-700">Управление автобусами</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Автобусный парк</CardTitle>
            <CardDescription>Управление информацией об автобусах</CardDescription>
          </CardHeader>
          <CardContent>
            <BusTable />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

