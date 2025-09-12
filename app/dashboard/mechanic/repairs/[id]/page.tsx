"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { repairBusService } from "@/service/repairBusService";
import type { Repair } from "@/types/repairBus.types";

// Если хочешь редактирование прямо отсюда — раскомментируй импорт
// import EditRepairDialog from "../../components/EditRepairDialog";

export default function RepairDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await repairBusService.getById(id);
        setRepair(res.value ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const fmtDate = (s?: string) => {
    if (!s || s === "0001-01-01") return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU");
  };

  const money = (n?: number | null) => (n ?? 0).toLocaleString("ru-RU") + " ₸";

  const meta = useMemo(() => {
    if (!repair) return { app: "—", dep: "—", ent: "—" };
    return {
      app: repair.applicationNumber || "—",
      dep: fmtDate(repair.departureDate),
      ent: fmtDate(repair.entryDate),
    };
  }, [repair]);

  async function onDelete() {
    if (!repair) return;
    if (!confirm("Удалить эту запись ремонта?")) return;
    setDeleting(true);
    try {
      await repairBusService.remove(repair.id);
      router.back();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Хедер + действия */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">
          Ремонт № {meta.app} — {repair?.garageNumber ?? "—"} / {repair?.govNumber ?? "—"}
        </h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Назад</Button>
          {repair && (
            <Button asChild>
              <Link href={`/dashboard/mechanic/repairs/${repair.id}/print`}>Печать</Link>
            </Button>
          )}
          {/* Для встроенного редактирования — раскомментируй
          {repair && (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Редактировать
            </Button>
          )} */}
          {repair && (
            <Button variant="destructive" onClick={onDelete} disabled={deleting}>
              {deleting ? "Удаление…" : "Удалить"}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Общие сведения</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <div className="text-muted-foreground">№ заявки</div>
            <div className="font-medium">{meta.app}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Гаражный №</div>
            <div className="font-medium">{repair?.garageNumber ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Гос. номер</div>
            <div className="font-medium">{repair?.govNumber ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Дата выезда</div>
            <div className="font-medium">{meta.dep}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Дата въезда</div>
            <div className="font-medium">{meta.ent}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Создано</div>
            <div className="font-medium">
              {repair?.createdAt
                ? new Date(repair.createdAt).toLocaleString("ru-RU")
                : "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Запчасти */}
        <Card>
          <CardHeader>
            <CardTitle>Запасные части</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Артикул</th>
                    <th className="py-2 pr-4">Наименование</th>
                    <th className="py-2 pr-4 text-right">Кол-во</th>
                    <th className="py-2 pr-4 text-right">Цена</th>
                    <th className="py-2 pr-0 text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-2 pr-4">{repair?.sparePartArticle || "—"}</td>
                    <td className="py-2 pr-4">{repair?.sparePart || "—"}</td>
                    <td className="py-2 pr-4 text-right">{repair?.sparePartCount ?? 0}</td>
                    <td className="py-2 pr-4 text-right">
                      {(repair?.sparePartPrice ?? 0).toLocaleString("ru-RU")}
                    </td>
                    <td className="py-2 pr-0 text-right">
                      {(repair?.sparePartSum ?? 0).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t font-medium">
                    <td className="py-2 pr-4" colSpan={4}>Итого по запчастям</td>
                    <td className="py-2 pr-0 text-right">
                      {(repair?.sparePartSum ?? 0).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Работы */}
        <Card>
          <CardHeader>
            <CardTitle>Работы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Код операции</th>
                    <th className="py-2 pr-4">Наименование работы</th>
                    <th className="py-2 pr-4 text-right">Кол-во</th>
                    <th className="py-2 pr-4 text-right">Часы</th>
                    <th className="py-2 pr-4 text-right">Цена</th>
                    <th className="py-2 pr-0 text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-2 pr-4">{repair?.workCode || "—"}</td>
                    <td className="py-2 pr-4">{repair?.workName || "—"}</td>
                    <td className="py-2 pr-4 text-right">{repair?.workCount ?? 0}</td>
                    <td className="py-2 pr-4 text-right">{repair?.workHour ?? 0}</td>
                    <td className="py-2 pr-4 text-right">
                      {(repair?.workPrice ?? 0).toLocaleString("ru-RU")}
                    </td>
                    <td className="py-2 pr-0 text-right">
                      {(repair?.workSum ?? 0).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t font-medium">
                    <td className="py-2 pr-4" colSpan={5}>Итого по работам</td>
                    <td className="py-2 pr-0 text-right">
                      {(repair?.workSum ?? 0).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Общий итог */}
      <Card>
        <CardHeader>
          <CardTitle>Итоги</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-end">
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="py-1 pr-6 text-muted-foreground">Итого по работам:</td>
                <td className="py-1 text-right">{money(repair?.workSum)}</td>
              </tr>
              <tr>
                <td className="py-1 pr-6 text-muted-foreground">Итого по запчастям:</td>
                <td className="py-1 text-right">{money(repair?.sparePartSum)}</td>
              </tr>
              <tr>
                <td className="py-1 pr-6 font-semibold">Всего к оплате:</td>
                <td className="py-1 text-right font-semibold">{money(repair?.allSum)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Встроенный диалог редактирования — при необходимости
      {editOpen && repair && (
        <EditRepairDialog
          repair={repair}
          onClose={() => setEditOpen(false)}
          onUpdated={(updated) => setRepair(updated)}
        />
      )} */}
    </div>
  );
}
