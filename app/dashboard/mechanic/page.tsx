"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Wrench, PlusCircle } from "lucide-react";
import { repairBusService } from "@/service/repairBusService";
import type { Repair } from "@/types/repairBus.types";

export default function MechanicHomePage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [depotId, setDepotId] = useState<string | null>(null);

  useEffect(() => {
    // берём depotId из authData, если он там есть
    const auth = localStorage.getItem("authData");
    if (auth) {
      const u = JSON.parse(auth);
      setDepotId(u?.depotId || u?.busDepotId || null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = depotId
          ? await repairBusService.getByDepotId(depotId)
          : await repairBusService.getAll();
        setRepairs(res.value ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId]);

  // KPI
  const {
    todayCount,
    weekCount,
    monthSum,
    recent,
  } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now); // последние 7 дней
    startOfWeek.setDate(now.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const todayCount = repairs.filter(r => {
      const t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      return t >= startOfToday;
    }).length;

    const weekCount = repairs.filter(r => {
      const t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      return t >= startOfWeek.getTime();
    }).length;

    const monthSum = repairs.reduce((acc, r) => {
      const t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      if (t >= startOfMonth) acc += r.allSum ?? 0;
      return acc;
    }, 0);

    const recent = [...repairs]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);

    return { todayCount, weekCount, monthSum, recent };
  }, [repairs]);

  return (
    <div className="space-y-6">
      {/* Заголовок + быстрые действия */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Механик — главная</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/mechanic/repairs/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Создать ремонт
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/mechanic/repairs">
              <ClipboardList className="mr-2 h-4 w-4" /> Реестр ремонтов
            </Link>
          </Button>
        </div>
      </div>

      {/* Карточки KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-600" />
              Ремонты сегодня
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{loading ? "…" : todayCount}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-sky-600" />
              За 7 дней
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{loading ? "…" : weekCount}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-emerald-600" />
              Сумма за месяц
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? "…" : `${monthSum.toLocaleString("ru-RU")} ₸`}
          </CardContent>
        </Card>
      </div>

      {/* Последние ремонты */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Последние ремонты</CardTitle>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/mechanic/repairs">Открыть реестр</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка…</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">Пока нет данных</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">№ заявки</th>
                    <th className="py-2 pr-4">Автобус</th>
                    <th className="py-2 pr-4">Работа / Запчасть</th>
                    <th className="py-2 pr-4">Сумма</th>
                    <th className="py-2">Создано</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-4">
                        <Link
                          className="text-sky-600 hover:underline"
                          href={`/dashboard/mechanic/repairs/${r.id}`}
                        >
                          {r.applicationNumber || "—"}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">
                        {r.garageNumber || "—"} / {r.govNumber || "—"}
                      </td>
                      <td className="py-2 pr-4">{r.workName || r.sparePart || "—"}</td>
                      <td className="py-2 pr-4">
                        {(r.allSum ?? 0).toLocaleString("ru-RU")} ₸
                      </td>
                      <td className="py-2">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
