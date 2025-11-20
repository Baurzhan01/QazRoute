"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCcw, Search } from "lucide-react"
import { busAggregateService } from "@/service/busAggregateService"
import type { BusAggregate } from "@/types/busAggregate.types"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import AttachmentThumbnail from "../components/AttachmentThumbnail"
import AttachmentPreviewDialog from "../components/AttachmentPreviewDialog"
import { buildAbsoluteUrl } from "../utils"

const formatDisplayDate = (value: string) => {
  const [day, month, year] = value.split("-")
  return `${day}.${month}.${year}`
}

export default function OTKJournalPage() {
  const { toast } = useToast()
  const [aggregates, setAggregates] = useState<BusAggregate[]>([])
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [previewState, setPreviewState] = useState<{ open: boolean; images: string[]; index: number }>({
    open: false,
    images: [],
    index: 0,
  })

  const fetchAggregates = useCallback(
    async (searchValue?: string) => {
      setLoading(true)
      try {
        const res = await busAggregateService.getAll({ page: 1, pageSize: 100, search: searchValue })
        setAggregates(res.value?.items ?? [])
        setTotalCount(res.value?.totalCount ?? res.value?.items?.length ?? 0)
      } catch (error) {
        console.error(error)
        toast({
          title: "Не удалось загрузить журнал",
          description: "Попробуйте снова немного позже",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchAggregates(debouncedSearch || undefined)
  }, [debouncedSearch, fetchAggregates])

  const openPreview = (urls: string[], index = 0) => {
    if (!urls.length) return
    setPreviewState({ open: true, images: urls.map(buildAbsoluteUrl), index })
  }

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
          <Button onClick={() => fetchAggregates(debouncedSearch || undefined)} variant="outline" className="gap-2" disabled={loading}>
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
              Найдено: {totalCount}
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
                  <TableHead className="text-right">Вложения</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregates.map((item) => (
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
                        <AttachmentThumbnail urls={item.urls} onPreview={openPreview} align="end" size="sm" showCount={false} />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && aggregates.length === 0 && (
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

      <AttachmentPreviewDialog
        open={previewState.open}
        images={previewState.images}
        initialIndex={previewState.index}
        onOpenChange={(open) => setPreviewState((prev) => ({ ...prev, open }))}
      />
    </div>
  )
}
