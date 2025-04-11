"use client"

import { Users, Plus, Search } from "lucide-react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { motion } from "framer-motion"
import DriverRow from "./DriverRow"
import DriverStatusStats from "./DriverStatusStats"
import type { Driver, DriverStatus, DriverStatusCount } from "@/types/driver.types"

interface DriversListProps {
  drivers: Driver[]
  loading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddClick: () => void
  onEditClick: (driver: Driver) => void
  onDeleteClick: (driver: Driver) => void
  onViewClick: (driver: Driver) => void
  onAddToReserveClick: (driver: Driver) => void
  onRemoveFromReserveClick: (driver: Driver) => void
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  inReserve: boolean
  onReserveToggle: (inReserve: boolean) => void
  busInfo: Record<string, any>
  statusCounts: DriverStatusCount
  selectedStatus: DriverStatus | null
  onStatusFilter: (status: DriverStatus | null) => void
}

export default function DriversList({
  drivers,
  loading,
  error,
  searchQuery,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onViewClick,
  onAddToReserveClick,
  onRemoveFromReserveClick,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  inReserve,
  onReserveToggle,
  busInfo,
  statusCounts,
  selectedStatus,
  onStatusFilter,
}: DriversListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  // Клиентская пагинация
  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Поиск по имени или номеру..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить водителя
        </Button>
      </div>

      <DriverStatusStats
        statusCounts={statusCounts}
        onStatusClick={(status) => onStatusFilter(status as DriverStatus | null)}
        selectedStatus={selectedStatus}
        inReserve={inReserve}
      />

      <Tabs defaultValue={inReserve ? "reserve" : "active"} className="mb-6">
        <TabsList>
          <TabsTrigger value="active" onClick={() => onReserveToggle(false)}>
            Активные водители
          </TabsTrigger>
          <TabsTrigger value="reserve" onClick={() => onReserveToggle(true)}>
            Резерв водителей
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              {inReserve ? "Резерв водителей" : "Список водителей"}
              <span className="text-sm font-normal text-gray-500 ml-2">(всего: {drivers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
            ) : paginatedDrivers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery
                    ? "Водители не найдены"
                    : inReserve
                    ? "Нет водителей в резерве"
                    : "Нет доступных водителей"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `По запросу "${searchQuery}" ничего не найдено`
                    : inReserve
                    ? "В резерве нет водителей"
                    : "В системе нет зарегистрированных водителей"}
                </p>
                {!searchQuery && !inReserve && (
                  <Button onClick={onAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить водителя
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">№</TableHead>
                      <TableHead>Фото</TableHead>
                      <TableHead>ФИО</TableHead>
                      <TableHead>Табельный номер</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Автобус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDrivers.map((driver, index) => (
                      <DriverRow
                        key={driver.id}
                        driver={driver}
                        rowNumber={(currentPage - 1) * pageSize + index + 1}
                        busInfo={driver.busId ? busInfo[driver.busId] : null}
                        onEdit={() => onEditClick(driver)}
                        onDelete={() => onDeleteClick(driver)}
                        onView={() => onViewClick(driver)}
                        onAddToReserve={() => onAddToReserveClick(driver)}
                        onRemoveFromReserve={() => onRemoveFromReserveClick(driver)}
                        inReserve={inReserve}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) onPageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onPageChange(pageNum)
                          }}
                          isActive={pageNum === currentPage}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) onPageChange(currentPage + 1)
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}
