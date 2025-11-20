"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Search, Camera, Upload, Paperclip, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { busService } from "@/service/busService"
import { busAggregateService } from "@/service/busAggregateService"
import { minioService } from "@/service/minioService"
import { API_BASE_URL } from "@/app/api/apiService"
import type { BusDepotItem } from "@/types/bus.types"
import type { BusAggregate } from "@/types/busAggregate.types"

interface AttachmentPreview {
  name: string
  url: string
}

const formatApiDate = (value: string) => {
  const [year, month, day] = value.split("-")
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (value: string) => {
  const parts = value.split("-")
  if (parts.length !== 3) return value
  if (parts[0].length === 4) {
    const [year, month, day] = parts
    return `${day}.${month}.${year}`
  }
  const [day, month, year] = parts
  return `${day}.${month}.${year}`
}

const withAbsoluteUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url
  const host = (process.env.NEXT_PUBLIC_API_URL || API_BASE_URL || "").replace(/\/$/, "")
  const normalized = url.startsWith("/") ? url : `/${url}`
  return `${host}${normalized}`
}

export default function OTKDashboardPage() {
  const { toast } = useToast()
  const [depotId, setDepotId] = useState<string | null>(null)
  const [busQuery, setBusQuery] = useState("")
  const [busResults, setBusResults] = useState<BusDepotItem[]>([])
  const [isSearchingBus, setIsSearchingBus] = useState(false)
  const [selectedBus, setSelectedBus] = useState<BusDepotItem | null>(null)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [aggregates, setAggregates] = useState<BusAggregate[]>([])
  const [isLoadingAggregates, setIsLoadingAggregates] = useState(false)
  const [previewState, setPreviewState] = useState<{ open: boolean; images: string[]; index: number; zoomed: boolean }>({
    open: false,
    images: [],
    index: 0,
    zoomed: false,
  })

  useEffect(() => {
    const auth = localStorage.getItem("authData")
    if (auth) {
      const parsed = JSON.parse(auth)
      setDepotId(parsed?.depotId || parsed?.busDepotId || null)
    }
  }, [])

  const loadAggregates = useCallback(async () => {
    setIsLoadingAggregates(true)
    try {
      const res = await busAggregateService.getAll()
      setAggregates(res.value ?? [])
    } catch (error) {
      console.error(error)
      toast({
        title: "Не удалось загрузить записи",
        description: "Обновите страницу или попробуйте позже",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAggregates(false)
    }
  }, [toast])

  useEffect(() => {
    loadAggregates()
  }, [loadAggregates])

  const handleSearchBus = async () => {
    if (!depotId) {
      toast({
        title: "Не найден парк",
        description: "Вашему профилю не назначен автобусный парк",
        variant: "destructive",
      })
      return
    }

    setIsSearchingBus(true)
    try {
      const response = await busService.searchByDepot(depotId, busQuery)
      setBusResults(response.value?.items ?? [])
    } catch (error) {
      console.error(error)
      toast({
        title: "Ошибка поиска автобуса",
        description: "Попробуйте изменить запрос или повторите позже",
        variant: "destructive",
      })
    } finally {
      setIsSearchingBus(false)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          const uploaded = await minioService.upload(file)
          return { name: uploaded.fileName || file.name, url: uploaded.url }
        })
      )
      setAttachments((prev) => [...prev, ...uploads])
      toast({ title: "Файлы загружены", description: `${uploads.length} файл(ов) готовы к сохранению` })
    } catch (error) {
      console.error(error)
      toast({
        title: "Не удалось загрузить файл",
        description: "Проверьте подключение или формат изображения",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  const handleSave = async () => {
    if (!selectedBus) {
      toast({ title: "Выберите автобус", description: "Нужно указать автобус перед сохранением", variant: "destructive" })
      return
    }
    if (!description.trim()) {
      toast({ title: "Опишите проблему", description: "Поле описание не должно быть пустым", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      await busAggregateService.create({
        busId: selectedBus.id,
        description: description.trim(),
        urls: attachments.map((item) => item.url),
        date: formatApiDate(date),
      })
      toast({ title: "Запись сохранена", description: "Информация об агрегате добавлена" })
      setDescription("")
      setAttachments([])
      await loadAggregates()
    } catch (error) {
      console.error(error)
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось создать запись. Попробуйте снова",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const removeAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((file) => file.name !== name))
  }

  const handleSelectBus = (bus: BusDepotItem) => {
    setSelectedBus(bus)
    setBusQuery(bus.govNumber || bus.garageNumber || "")
    setBusResults([])
  }

  const recentAggregates = useMemo(() => aggregates.slice(0, 5), [aggregates])

  const openPreview = (images: string[], index = 0) => {
    if (!images.length) return
    setPreviewState({ open: true, images: images.map(withAbsoluteUrl), index, zoomed: false })
  }

  const closePreview = () => setPreviewState((prev) => ({ ...prev, open: false, zoomed: false }))

  const goToPrevImage = () =>
    setPreviewState((prev) => ({
      ...prev,
      index: prev.images.length ? (prev.index - 1 + prev.images.length) % prev.images.length : 0,
      zoomed: false,
    }))

  const goToNextImage = () =>
    setPreviewState((prev) => ({
      ...prev,
      index: prev.images.length ? (prev.index + 1) % prev.images.length : 0,
      zoomed: false,
    }))

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">ОТК · контроль агрегатов</p>
          <h1 className="text-3xl font-bold text-gray-900">Журнал агрегатных частей</h1>
          <p className="text-gray-500 text-sm">
            Фиксируйте найденные неисправности, прикрепляйте фото и отслеживайте историю по каждому автобусу.
          </p>
        </div>
        <Button variant="outline" className="w-full md:w-auto" onClick={loadAggregates} disabled={isLoadingAggregates}>
          {isLoadingAggregates && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Обновить список
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border border-emerald-100 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Новая запись</CardTitle>
            <p className="text-sm text-gray-500">Выберите автобус, опишите проблему и добавьте фото.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Поиск автобуса</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Госномер или гаражный (например, 1234 или 123ABC01)"
                  value={busQuery}
                  onChange={(e) => setBusQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearchBus} disabled={isSearchingBus} className="gap-2">
                  {isSearchingBus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Найти
                </Button>
              </div>
              {busResults.length > 0 && (
                <ScrollArea className="max-h-48 rounded-lg border border-gray-100">
                  <div className="divide-y">
                    {busResults.map((bus) => {
                      const isActive = selectedBus?.id === bus.id
                      return (
                        <button
                          key={bus.id}
                          onClick={() => handleSelectBus(bus)}
                          className={`w-full text-left px-4 py-3 transition hover:bg-emerald-50 ${
                            isActive ? "bg-emerald-100/80" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {bus.govNumber || "—"} · {bus.garageNumber || "—"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {bus.brand ?? "Марка неизвестна"} · {bus.busStatus ?? "Статус неизвестен"}
                              </p>
                            </div>
                            {isActive && <Badge className="bg-emerald-600">Выбрано</Badge>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
              {selectedBus && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">Текущий автобус:</p>
                  <p>{selectedBus.govNumber || "—"} · гаражный {selectedBus.garageNumber || "—"}</p>
                  {selectedBus.brand && <p className="text-xs text-emerald-800">{selectedBus.brand}</p>}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Дата события</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Описание проблемы</label>
              <Textarea
                placeholder="Например: посторонний шум в редукторе при ускорении, заметны следы утечки масла."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Фото / файлы</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 px-4 py-6 text-emerald-700 transition hover:bg-emerald-50 sm:flex-none sm:px-6">
                  <Camera className="h-5 w-5" />
                  <span className="text-sm font-medium">Снять фото</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    multiple
                    onChange={handleUpload}
                  />
                </label>
                <label className="flex cursor-pointer flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 px-4 py-6 text-emerald-700 transition hover:bg-emerald-50 sm:flex-none sm:px-6">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">Выбрать файл</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                </label>
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Загрузка файлов...
                </div>
              )}
              {attachments.length > 0 && (
                <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">Прикреплено:</p>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file) => (
                      <Badge key={file.name} variant="secondary" className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {file.name}
                        <button
                          className="ml-1 text-xs text-gray-500 hover:text-gray-900"
                          onClick={() => removeAttachment(file.name)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button className="w-full gap-2" onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              {isSaving ? "Сохраняем..." : "Сохранить запись"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Последние записи</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAggregates ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : recentAggregates.length === 0 ? (
              <p className="text-sm text-gray-500">Пока нет записей. Создайте первую, чтобы начать историю.</p>
            ) : (
              <div className="space-y-4">
                {recentAggregates.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                      <span>{formatDisplayDate(item.date)}</span>
                      <span>{item.busGarageNumber || "гараж №?"}</span>
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">{item.busGovNumber || "госномер неизвестен"}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    {item.urls?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.urls.map((url, index) => (
                          <Button
                            key={url}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => openPreview(item.urls || [], index)}
                          >
                            <Paperclip className="mr-1 h-3 w-3" />
                            Фото {index + 1}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Журнал за всё время</CardTitle>
            <p className="text-sm text-gray-500">Краткая таблица последних 10 записей. Полный список в разделе “Журнал”.</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/dashboard/otk/journal">Открыть журнал</a>
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[420px]">
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
                {aggregates.slice(0, 10).map((aggregate) => (
                  <TableRow key={aggregate.id}>
                    <TableCell className="font-medium">{formatDisplayDate(aggregate.date)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold">{aggregate.busGovNumber || "—"}</span>
                        <span className="text-gray-500 text-xs">гараж {aggregate.busGarageNumber || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{aggregate.description}</TableCell>
                    <TableCell className="text-right">
                      {aggregate.urls?.length ? (
                        <div className="flex flex-wrap justify-end gap-1">
                          {aggregate.urls.map((url, index) => (
                            <Button
                              key={url + index}
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => openPreview(aggregate.urls || [], index)}
                            >
                              <Paperclip className="mr-1 h-3 w-3" />
                              Фото {index + 1}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {aggregates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-gray-500">
                      Записей пока нет
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={previewState.open} onOpenChange={(open) => (open ? setPreviewState((prev) => ({ ...prev, open })) : closePreview())}>
        <DialogContent className="sm:max-w-4xl lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Просмотр вложений</DialogTitle>
          </DialogHeader>
          {previewState.images.length ? (
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative w-full overflow-hidden rounded-xl bg-black/5">
                <img
                  src={previewState.images[previewState.index]}
                  alt={`Фото ${previewState.index + 1}`}
                  className={cn(
                    "h-[320px] w-full cursor-zoom-in select-none bg-white object-contain transition duration-200 ease-in-out sm:h-[400px] lg:h-[70vh]",
                    previewState.zoomed && "scale-150 cursor-zoom-out"
                  )}
                  onClick={() =>
                    setPreviewState((prev) => ({
                      ...prev,
                      zoomed: !prev.zoomed,
                    }))
                  }
                />
                {previewState.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80"
                      onClick={goToPrevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80"
                      onClick={goToNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Фото {previewState.index + 1} из {previewState.images.length}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {previewState.images.map((url, idx) => (
                  <button
                    key={url + idx}
                    onClick={() => setPreviewState((prev) => ({ ...prev, index: idx, zoomed: false }))}
                    className={cn(
                      "h-16 w-16 overflow-hidden rounded-md border",
                      idx === previewState.index ? "border-emerald-500" : "border-gray-200"
                    )}
                  >
                    <img src={url} alt={`Миниатюра ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Нет вложений для просмотра</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
