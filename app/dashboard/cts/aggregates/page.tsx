"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCcw, FileText, PencilLine } from "lucide-react";
import { busAggregateService } from "@/service/busAggregateService";
import { BUS_AGGREGATE_STATUS_BADGE_VARIANT, getBusAggregateStatusLabel } from "@/lib/busAggregateStatus";
import type { BusAggregate } from "@/types/busAggregate.types";
import { BusAggregateStatus } from "@/types/busAggregate.types";
import { useToast } from "@/components/ui/use-toast";
import { getAuthData } from "@/lib/auth-utils";
import { buildAbsoluteUrl } from "@/app/dashboard/otk/utils";
import { AggregateEditor } from "./components/AggregateEditor";
import { DefectActModal } from "./components/DefectActModal";
import AttachmentPreviewDialog from "@/app/dashboard/otk/components/AttachmentPreviewDialog";
import AttachmentThumbnail from "@/app/dashboard/otk/components/AttachmentThumbnail";

export default function CtsAggregatesPage() {
  const { toast } = useToast();
  const [aggregates, setAggregates] = useState<BusAggregate[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BusAggregateStatus | "all">("all");
  const [selected, setSelected] = useState<BusAggregate | null>(null);
  const [actPreview, setActPreview] = useState<BusAggregate | null>(null);
  const [previewState, setPreviewState] = useState<{ open: boolean; images: string[]; index: number }>({
    open: false,
    images: [],
    index: 0,
  });

  const depotId = useMemo(() => getAuthData()?.busDepotId ?? null, []);

  const loadAggregates = async (searchValue?: string) => {
    setLoading(true);
    try {
      const res = await busAggregateService.getAll({ page: 1, pageSize: 100, search: searchValue });
      setAggregates(res.value?.items ?? []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Не удалось загрузить",
        description: "Ошибка при получении журнала",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAggregates(search.trim() || undefined);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filteredAggregates = useMemo(() => {
    const q = search.toLowerCase();
    return aggregates.filter((agg) => {
      const matchesStatus = statusFilter === "all" || agg.status === statusFilter;
      const matchesQuery =
        !q ||
        agg.busGovNumber?.toLowerCase().includes(q) ||
        agg.busGarageNumber?.toLowerCase().includes(q) ||
        agg.description?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [aggregates, search, statusFilter]);

  const updateAggregateInState = (updated: BusAggregate) => {
    setAggregates((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleSaved = async (updated: BusAggregate) => {
    updateAggregateInState(updated);
    await loadAggregates(search.trim() || undefined);
    setSelected(null);
  };

  const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

  const openPreview = (urls: string[], index = 0) => {
    if (!urls.length) return;
    setPreviewState({ open: true, images: urls.map(buildAbsoluteUrl), index });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">ЦТС · управление агрегатами</p>
          <h1 className="text-3xl font-bold text-gray-900">Журнал агрегатов</h1>
          <p className="text-gray-500 text-sm">Записи ОТК, которыми управляет ЦТС: статусы, акты, установка на автобусы.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadAggregates(search.trim() || undefined)} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Обновить
          </Button>
        </div>
      </div>

      <Card className="border border-sky-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Фильтр</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <Input
            placeholder="Поиск по гос/гаражному или описанию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as BusAggregateStatus | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.values(BusAggregateStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {getBusAggregateStatusLabel(s as BusAggregateStatus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Записи журнала ({filteredAggregates.length})</CardTitle>
          <Link href="/dashboard/otk/journal" className="text-sm text-blue-600 hover:underline">
            Открыть журнал ОТК
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Автобус</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Установлен на</TableHead>
                <TableHead>Дата установки</TableHead>
                <TableHead>Файлы</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredAggregates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Нет записей
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filteredAggregates.map((item, idx) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="font-medium text-gray-500">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.date ? item.date.split("-").reverse().join(".") : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{item.busGovNumber || "—"}</span>
                        <span className="text-xs text-gray-500">гараж {item.busGarageNumber || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={BUS_AGGREGATE_STATUS_BADGE_VARIANT[item.status]}>
                        {getBusAggregateStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {item.installedBusId ? (
                        <>
                          <div className="font-semibold text-emerald-700">
                            {item.installedBusGovNumber || "—"}
                          </div>
                          <div className="text-xs text-emerald-600">
                            гараж {item.installedBusGarageNumber || "—"}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {item.installedBusId ? (
                        item.installedDate ? item.installedDate.split("-").reverse().join(".") : "—"
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {item.urlAct &&
                          (isPdf(item.urlAct) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-12 px-2 text-xs"
                              onClick={() => window.open(buildAbsoluteUrl(item.urlAct!), "_blank")}
                            >
                              <FileText className="mr-1 h-4 w-4" />
                              Акт (PDF)
                            </Button>
                          ) : (
                            <button
                              type="button"
                              className="h-12 w-12 overflow-hidden rounded border"
                              onClick={() => openPreview([item.urlAct!], 0)}
                            >
                              <img
                                src={buildAbsoluteUrl(item.urlAct!)}
                                alt="Акт"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        {item.urls?.length ? (
                          <AttachmentThumbnail
                            urls={item.urls}
                            onPreview={(urls: string[], idx = 0) => openPreview(urls, idx)}
                            size="sm"
                            showCount
                          />
                        ) : (
                          !item.urlAct && <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setActPreview(item)}
                          disabled={item.status !== BusAggregateStatus.Decommissioned}
                          title={item.status !== BusAggregateStatus.Decommissioned ? "Доступно только при статусе «Списан»" : undefined}
                        >
                          <FileText className="h-4 w-4" />
                          Акт
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => setSelected(item)}
                        >
                          <PencilLine className="h-4 w-4" />
                          Редактировать
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AggregateEditor
        aggregate={selected}
        depotId={depotId}
        open={!!selected}
        onClose={() => setSelected(null)}
        onSaved={handleSaved}
      />

      <DefectActModal aggregate={actPreview} open={!!actPreview} onClose={() => setActPreview(null)} />

      <AttachmentPreviewDialog
        open={previewState.open}
        images={previewState.images}
        initialIndex={previewState.index}
        onOpenChange={(open: boolean) => setPreviewState((prev) => ({ ...prev, open }))}
      />
    </div>
  );
}
