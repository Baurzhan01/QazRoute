"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText } from "lucide-react";
import { busAggregateService } from "@/service/busAggregateService";
import { minioService } from "@/service/minioService";
import { BUS_AGGREGATE_STATUS_BADGE_VARIANT, getBusAggregateStatusLabel } from "@/lib/busAggregateStatus";
import type { BusAggregate } from "@/types/busAggregate.types";
import { BusAggregateStatus } from "@/types/busAggregate.types";
import type { BusDepotItem } from "@/types/bus.types";
import { useToast } from "@/components/ui/use-toast";
import { useBusSearch } from "../hooks/useBusSearch";
import { buildAbsoluteUrl } from "@/app/dashboard/otk/utils";
import { DefectActModal } from "./DefectActModal";

interface AggregateEditorProps {
  aggregate: BusAggregate | null;
  depotId?: string | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: BusAggregate) => void;
}

export function AggregateEditor({ aggregate, depotId, open, onClose, onSaved }: AggregateEditorProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<BusAggregateStatus>(BusAggregateStatus.InRepair);
  const [urlAct, setUrlAct] = useState<string | null>(null);
  const [installedDate, setInstalledDate] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [installedBus, setInstalledBus] = useState<BusDepotItem | null>(null);
  const [actModalOpen, setActModalOpen] = useState(false);

  const { query, setQuery, results, loading: busesLoading } = useBusSearch(depotId);

  useEffect(() => {
    if (!aggregate) return;
    setStatus(aggregate.status || BusAggregateStatus.InRepair);
    setUrlAct(aggregate.urlAct || null);
    setInstalledDate(aggregate.installedDate || "");
    setInstalledBus(null);
    setQuery("");
  }, [aggregate, setQuery]);

  const requiresAct = status === BusAggregateStatus.Decommissioned;
  const requiresInstallInfo = status === BusAggregateStatus.Installed;

  const canSave = useMemo(() => {
    if (requiresAct && !urlAct) return false;
    if (requiresInstallInfo && !installedBus) return false;
    return true;
  }, [requiresAct, urlAct, requiresInstallInfo, installedBus]);

  const handleUploadAct = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];
    setUploading(true);
    try {
      const uploaded = await minioService.upload(file);
      setUrlAct(uploaded.url);
      toast({ title: "Акт загружен", description: "Файл успешно прикреплён" });
    } catch {
      toast({ title: "Ошибка загрузки", description: "Не удалось загрузить акт", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!aggregate) return;
    if (requiresAct && !urlAct) {
      toast({ title: "Нужно приложить акт", description: "Для статуса «Списан» приложите дефектный акт", variant: "destructive" });
      return;
    }
    if (requiresInstallInfo && !installedBus) {
      toast({ title: "Укажите автобус", description: "Для статуса «Установлен» выберите автобус", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await busAggregateService.update(aggregate.id, {
        description: aggregate.description,
        urls: aggregate.urls || [],
        date: aggregate.date,
        status,
        urlAct: urlAct ?? null,
        installedBusId: requiresInstallInfo ? installedBus?.id ?? null : null,
        installedDate: requiresInstallInfo ? installedDate || null : null,
      });

      if (res.isSuccess && res.value) {
        toast({ title: "Сохранено", description: "Запись журнала обновлена" });
        onSaved(res.value);
        onClose();
      } else {
        toast({ title: "Не удалось сохранить", description: res.error || "Попробуйте позже", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Ошибка", description: "Не удалось обновить запись", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Управление записью</DialogTitle>
          {aggregate && (
            <p className="text-sm text-muted-foreground">
              Автобус {aggregate.busGarageNumber || "—"} · {aggregate.busGovNumber || "—"} — {aggregate.description}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as BusAggregateStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BusAggregateStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {getBusAggregateStatusLabel(s as BusAggregateStatus)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Акт (обязательно для «Списан»)</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" disabled={uploading}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Загрузка..." : "Загрузить"}
                    <input type="file" className="hidden" onChange={(e) => handleUploadAct(e.target.files)} />
                  </label>
                </Button>
                {urlAct && (
                  <a
                    href={buildAbsoluteUrl(urlAct)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Открыть файл
                  </a>
                )}
                {requiresAct && (
                  <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={() => setActModalOpen(true)}>
                    <FileText className="h-4 w-4" />
                    Дефектный акт
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Описание (readonly)</Label>
            <Textarea value={aggregate?.description || ""} readOnly />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Дата</Label>
              <Input type="date" value={aggregate?.date?.slice(0, 10) || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Статус ОТК</Label>
              {aggregate && (
                <Badge variant={BUS_AGGREGATE_STATUS_BADGE_VARIANT[aggregate.status]}>
                  {getBusAggregateStatusLabel(aggregate.status)}
                </Badge>
              )}
            </div>
          </div>

          {requiresInstallInfo && (
            <div className="space-y-3 rounded-md border p-3">
              <div className="space-y-2">
                <Label>Установлен на автобус</Label>
                <Input
                  placeholder="Поиск по гос/гаражному"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <div className="max-h-40 overflow-auto rounded-md border">
                    {busesLoading && <p className="p-2 text-sm text-muted-foreground">Поиск...</p>}
                    {!busesLoading && results.length === 0 && (
                      <p className="p-2 text-sm text-muted-foreground">Ничего не найдено</p>
                    )}
                    {!busesLoading &&
                      results.map((bus) => (
                        <button
                          key={bus.id}
                          type="button"
                          onClick={() => {
                            setInstalledBus(bus);
                            setQuery(`${bus.govNumber || ""} ${bus.garageNumber || ""}`.trim());
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <span>{bus.govNumber || "—"}</span>
                          <span className="text-xs text-muted-foreground">{bus.garageNumber || "гараж №"}</span>
                        </button>
                      ))}
                  </div>
                )}
                {installedBus && (
                  <p className="text-xs text-emerald-700">
                    Выбрано: {installedBus.govNumber || "—"} · {installedBus.garageNumber || "—"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Дата установки</Label>
                <Input
                  type="date"
                  value={installedDate || ""}
                  onChange={(e) => setInstalledDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>

      <DefectActModal aggregate={aggregate} open={actModalOpen} onClose={() => setActModalOpen(false)} />
    </Dialog>
  );
}
