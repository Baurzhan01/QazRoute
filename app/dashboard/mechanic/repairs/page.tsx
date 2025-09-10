"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { busService } from "@/service/busService";
import type { BusDepotItem } from "@/types/bus.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "../components/StatusBadge";
import AddRepairDialog from "../components/AddRepairDialog";

export default function MechanicRepairsEntryPage() {
  const [depotId, setDepotId] = useState<string | null>(null);
  const [items, setItems] = useState<BusDepotItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Поиск (с дебаунсом)
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");

  // Пагинация
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // depotId из authData
  useEffect(() => {
    const auth = localStorage.getItem("authData");
    if (auth) {
      const u = JSON.parse(auth);
      setDepotId(u?.depotId || u?.busDepotId || null);
    }
  }, []);

  // Дебаунс поиска
  useEffect(() => {
    const t = setTimeout(() => {
      setQDebounced(q.trim());
      // при новом поиске всегда в начало
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  // Загрузка с сервера — с учётом поиска и пагинации
  useEffect(() => {
    (async () => {
      if (!depotId) return;
      setLoading(true);
      try {
        const res = qDebounced
          ? await busService.searchByDepot(
              depotId,
              qDebounced,
              page.toString(),
              pageSize.toString()
            )
          : await busService.getByDepot(
              depotId,
              page.toString(),
              pageSize.toString()
            );

        setItems(res.value?.items ?? []);
        setTotalCount(res.value?.totalCount ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId, page, pageSize, qDebounced]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Журнал ремонта — автобусы парка</h1>
      </div>

      <Card className="shadow-lg border-0 bg-white rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 rounded-t-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Список автобусов</CardTitle>
            <div className="flex flex-wrap gap-3 items-center">
              <Input
                placeholder="Поиск по гаражному или гос. номеру…"
                className="w-80 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium">Показывать:</span>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 px-3 py-2"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  ← Пред.
                </Button>
                <div className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2">
                  Стр. <span className="font-bold text-blue-600">{page}</span> из{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 px-3 py-2"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  След. →
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="mt-2 text-gray-600">Загрузка данных...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Ничего не найдено</div>
              <div className="text-gray-400 text-sm mt-1">Попробуйте изменить параметры поиска</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left font-semibold text-gray-700 py-4 px-4 border-r border-gray-200">
                      Статус
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-4 border-r border-gray-200">
                      Гаражный №
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-4 border-r border-gray-200">
                      Гос. номер
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-4 border-r border-gray-200">
                      Марка/Тип
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-4 border-r border-gray-200">
                      VIN
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-4 border-r border-gray-200">
                      Год
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-4 border-r border-gray-200">
                      Пробег
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-4 border-r border-gray-200">
                      Водители
                    </th>
                    <th className="text-left font-semibold text-gray-700 py-4 px-4">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((b, index) => (
                    <tr
                      key={b.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-4 px-4 border-r border-gray-200">
                        <StatusBadge status={b.busStatus} />
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200 font-medium text-gray-900">
                        {b.garageNumber ?? "—"}
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200 font-medium text-blue-600">
                        {b.govNumber ?? "—"}
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200">
                        <div className="font-medium text-gray-900">{b.brand ?? "—"}</div>
                        {b.type && <div className="text-xs text-gray-500">{b.type}</div>}
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200 text-gray-600 font-mono text-xs">
                        {b.vinCode ?? "—"}
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200 text-gray-600">
                        {b.year ?? "—"}
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200 font-medium text-gray-900">
                        {b.mileage != null ? `${b.mileage.toLocaleString("ru-RU")} км` : "—"}
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200">
                        <div className="max-w-xs">
                          {b.drivers?.length ? (
                            <div className="text-sm">
                              {b.drivers.map((d, idx) => (
                                <div key={idx} className="text-gray-700 truncate">
                                  {d.fullName}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="link"
                            className="px-0 text-blue-600 hover:text-blue-800 text-sm font-medium justify-start h-auto p-0"
                            asChild
                          >
                            <Link href={`/dashboard/mechanic/repairs/bus/${b.id}`}>
                              📋 История автобуса
                            </Link>
                          </Button>
                          <AddRepairDialog
                            busId={b.id}
                            trigger={
                              <Button
                                variant="link"
                                className="px-0 text-green-600 hover:text-green-800 text-sm font-medium justify-start h-auto p-0"
                              >
                                🔧 Добавить ремонт
                              </Button>
                            }
                            onCreated={() => {
                              // После создания — сразу в историю автобуса
                              window.location.href = `/dashboard/mechanic/repairs/bus/${b.id}`;
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Пагинация снизу */}
              <div className="bg-gray-50 border-top border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Показано{" "}
                    <span className="font-medium text-gray-900">
                      {items.length}
                    </span>{" "}
                    из{" "}
                    <span className="font-medium text-gray-900">{totalCount}</span> автобусов
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="border-gray-300 hover:bg-white hover:border-blue-500 px-4 py-2"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || loading}
                    >
                      ← Предыдущая
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + Math.max(1, page - 2);
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            className={`px-3 py-2 text-sm rounded-md transition-colors ${
                              pageNum === page
                                ? "bg-blue-600 text-white font-medium"
                                : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                            }`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && page < totalPages - 2 && (
                        <>
                          <span className="text-gray-400 px-2">...</span>
                          <button
                            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-md"
                            onClick={() => setPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="border-gray-300 hover:bg-white hover:border-blue-500 px-4 py-2"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || loading}
                    >
                      Следующая →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
