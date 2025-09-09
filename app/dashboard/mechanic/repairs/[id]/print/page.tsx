"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { repairBusService } from "@/service/repairBusService";
import type { Repair } from "@/types/repairBus.types";

export default function RepairPrintPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await repairBusService.getById(params.id);
        setRepair(res.value ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id]);

  const fmtDate = (s?: string) => {
    if (!s || s === "0001-01-01") return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("ru-RU");
  };

  const money = (n?: number | null) => (n ?? 0).toLocaleString("ru-RU") + " ₸";

  return (
    <div className="p-4">
      {/* Кнопки экрана (не печатаются) */}
      <div className="no-print mb-4 flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>Назад</Button>
        <Button onClick={() => window.print()}>Печать</Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Загрузка…</div>
      ) : !repair ? (
        <div className="text-sm text-muted-foreground">Ремонт не найден</div>
      ) : (
        <div className="mx-auto bg-white shadow-sm print:shadow-none p-6 rounded-lg print:rounded-none max-w-[210mm]">
          {/* Шапка */}
          <div className="text-center mb-4">
            <div className="text-base font-semibold">АО «Автобусный парк №1»</div>
            <div className="text-sm text-gray-600">г. Астана</div>
          </div>

          <div className="text-center mb-6">
            <div className="text-xl font-bold uppercase">Заказ-наряд</div>
            <div className="text-sm text-gray-700">
              № {repair.applicationNumber || "—"} от{" "}
              {repair.createdAt
                ? new Date(repair.createdAt).toLocaleDateString("ru-RU")
                : "—"}
            </div>
          </div>

          {/* Информация по автобусу */}
          <table className="w-full text-sm mb-6">
            <tbody>
              <tr>
                <td className="py-1 align-top w-48 text-gray-600">Гаражный номер:</td>
                <td className="py-1">{repair.garageNumber || "—"}</td>
              </tr>
              <tr>
                <td className="py-1 align-top text-gray-600">Гос. номер:</td>
                <td className="py-1">{repair.govNumber || "—"}</td>
              </tr>
              <tr>
                <td className="py-1 align-top text-gray-600">Bus ID:</td>
                <td className="py-1">{repair.busId}</td>
              </tr>
              <tr>
                <td className="py-1 align-top text-gray-600">Дата выезда в ремонт:</td>
                <td className="py-1">{fmtDate(repair.departureDate)}</td>
              </tr>
              <tr>
                <td className="py-1 align-top text-gray-600">Дата въезда из ремонта:</td>
                <td className="py-1">{fmtDate(repair.entryDate)}</td>
              </tr>
            </tbody>
          </table>

          {/* Работы */}
          <div className="font-semibold mb-2">Раздел I. Работы</div>
          <table className="w-full text-sm border mb-6 border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Наименование</th>
                <th className="border border-gray-300 p-2 text-right">Кол-во, ед.</th>
                <th className="border border-gray-300 p-2 text-right">Часы</th>
                <th className="border border-gray-300 p-2 text-right">Цена, ₸</th>
                <th className="border border-gray-300 p-2 text-right">Сумма, ₸</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">{repair.workName || "—"}</td>
                <td className="border border-gray-300 p-2 text-right">{repair.workCount ?? 0}</td>
                <td className="border border-gray-300 p-2 text-right">{repair.workHour ?? 0}</td>
                <td className="border border-gray-300 p-2 text-right">{(repair.workPrice ?? 0).toLocaleString("ru-RU")}</td>
                <td className="border border-gray-300 p-2 text-right">{(repair.workSum ?? 0).toLocaleString("ru-RU")}</td>
              </tr>
            </tbody>
          </table>

          {/* Запчасти */}
          <div className="font-semibold mb-2">Раздел II. Запасные части и материалы</div>
          <table className="w-full text-sm border mb-6 border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Наименование</th>
                <th className="border border-gray-300 p-2 text-right">Кол-во, шт.</th>
                <th className="border border-gray-300 p-2 text-right">Цена, ₸</th>
                <th className="border border-gray-300 p-2 text-right">Сумма, ₸</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">{repair.sparePart || "—"}</td>
                <td className="border border-gray-300 p-2 text-right">{repair.sparePartCount ?? 0}</td>
                <td className="border border-gray-300 p-2 text-right">{(repair.sparePartPrice ?? 0).toLocaleString("ru-RU")}</td>
                <td className="border border-gray-300 p-2 text-right">{(repair.sparePartSum ?? 0).toLocaleString("ru-RU")}</td>
              </tr>
            </tbody>
          </table>

          {/* ИТОГО */}
          <div className="flex justify-end mb-8">
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Итого по работам:</td>
                  <td className="py-1 text-right">{money(repair.workSum)}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Итого по запчастям:</td>
                  <td className="py-1 text-right">{money(repair.sparePartSum)}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-semibold">Всего к оплате:</td>
                  <td className="py-1 text-right font-semibold">{money(repair.allSum)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Подписи */}
          <div className="grid grid-cols-1 gap-6 text-sm">
            <div className="flex justify-between">
              <div className="w-[48%]">
                <div className="text-gray-600">Механик</div>
                <div className="mt-8 border-t border-gray-400"></div>
              </div>
              <div className="w-[48%]">
                <div className="text-gray-600">Начальник колонны</div>
                <div className="mt-8 border-t border-gray-400"></div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="w-[48%]">
                <div className="text-gray-600">Водитель</div>
                <div className="mt-8 border-t border-gray-400"></div>
              </div>
              <div className="w-[48%]">
                <div className="text-gray-600">Примечание</div>
                <div className="mt-8 border-t border-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Локальные стили печати */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4; margin: 12mm; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
