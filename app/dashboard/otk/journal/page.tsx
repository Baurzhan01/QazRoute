"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCcw, Search, Paperclip } from "lucide-react"
import { busAggregateService } from "@/service/busAggregateService"
import type { BusAggregate } from "@/types/busAggregate.types"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

const formatDisplayDate = (value: string) => {
  const [day, month, year] = value.split("-")
  return `${day}.${month}.${year}`
}

export default function OTKJournalPage() {
  const { toast } = useToast()
  const [aggregates, setAggregates] = useState<BusAggregate[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchAggregates = async () => {
    setLoading(true)
    try {
      const res = await busAggregateService.getAll()
      setAggregates(res.value ?? [])
    } catch (error) {
      console.error(error)
      toast({
        title: "Не удалось загрузить журнал",
        description: "Повторите попытку позднее",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAggregates()
  }, [])

  const filteredAggregates = useMemo(() => {
    if (!search.trim()) return aggregates
    const q = search.trim().toLowerCase()
    return aggregates.filter((item) => {
      const haystack = [
        item.busGovNumber,
        item.busGarageNumber,
        item.description,
        formatDisplayDate(item.date),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [aggregates, search])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">Журнал ОТК</p>
          <h1 className="text-3xl font-bold text-gray-900">История записей по агрегатам</h1>
          <p className="text-gray-500 text-sm">Используйте поиск, чтобы быстро найти нужный автобус или описание.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/otk">На рабочий стол</Link>
          </Button>
          <Button onClick={fetchAggregates} variant="outline" className="gap-2" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Обновить
          </Button>
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Список записей</CardTitle>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по гос/гаражному номеру или описанию"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Badge variant="secondary" className="w-fit">
              Найдено: {filteredAggregates.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Автобус</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="text-right">Фото</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAggregates.map((item) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="font-medium text-gray-900">{formatDisplayDate(item.date)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{item.busGovNumber || "—"}</span>
                        <span className="text-sm text-gray-500">гаражный {item.busGarageNumber || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.urls?.length ? (
                        <div className="flex flex-col gap-1 text-right">
                          {item.urls.map((url, index) => (
                            <Button
                              key={url + index}
                              variant="ghost"
                              size="sm"
                              asChild
                              className="justify-end text-xs font-medium"
                            >
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Paperclip className="mr-1 h-3 w-3" />
                                Фото {index + 1}
                              </a>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredAggregates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-gray-500">
                      Записей не найдено
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-gray-400">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
