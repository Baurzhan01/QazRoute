"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { repairBusService } from "@/service/repairBusService";
import type { Repair } from "@/types/repairBus.types";

export default function RepairPrintPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // исходная запись, по которой открыли печать
  const [baseRepair, setBaseRepair] = useState<Repair | null>(null);
  // все строки той же заявки (один applicationNumber)
  const [batch, setBatch] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);

  // ссылка на область для печати / PDF
  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        // 1) текущая строка
        const one = await repairBusService.getById(id);
        const current = one.value ?? null;
        setBaseRepair(current);

        // 2) подтянуть все строки той же заявки
        if (current?.busId) {
          const allRes = await repairBusService.getByBusId(current.busId);
          const all = allRes.value ?? [];
          const sameApp = all
            .filter(r => r.applicationNumber === current.applicationNumber)
            .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
          setBatch(sameApp.length ? sameApp : (current ? [current] : []));
        } else {
          setBatch(current ? [current] : []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // секции, суммы, хедер
  const { parts, works, totals, busHeader, orderDateForHeader } = useMemo(() => {
    const parts = (batch ?? []).filter(r => (r.sparePart ?? "").trim() !== "");
    const works = (batch ?? []).filter(r => (r.workName ?? "").trim() !== "");

    const partsSum = parts.reduce(
      (s, x) => s + (x.sparePartSum ?? (x.sparePartCount || 0) * (x.sparePartPrice || 0)),
      0
    );
    const worksSum = works.reduce(
      (s, x) => s + (x.workSum ?? (x.workHour || 0) * (x.workPrice || 0)),
      0
    );
    const total = (batch ?? []).reduce((s, x) => s + (x.allSum ?? 0), 0);

    const any = batch?.[0] ?? baseRepair;
    // дата в заголовке — по ТЗ берем entryDate (если её нет/0001-01-01, падаем на departureDate)
    const entry = any?.entryDate && any.entryDate !== "0001-01-01" ? any.entryDate : null;
    const dep = any?.departureDate && any.departureDate !== "0001-01-01" ? any.departureDate : null;
    const orderDateForHeader = entry ?? dep ?? "";

    return {
      parts,
      works,
      totals: { partsSum, worksSum, total },
      busHeader: {
        garageNumber: any?.garageNumber ?? "—",
        govNumber: any?.govNumber ?? "—",
        departureDate: any?.departureDate ?? "0001-01-01",
        entryDate: any?.entryDate ?? "0001-01-01",
        applicationNumber: any?.applicationNumber ?? 0,
      },
      orderDateForHeader,
    };
  }, [batch, baseRepair]);

  const fmtDate = (s?: string) => {
    if (!s || s === "0001-01-01") return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU");
  };
  const money = (n?: number | null) => (n ?? 0).toLocaleString("ru-RU") + " ₸";

  // ---------- Экспорт в PDF (через html2pdf.js) ----------
  async function ensureHtml2Pdf(): Promise<void> {
    if (typeof window === "undefined") return;
    if ((window as any).html2pdf) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Не удалось загрузить html2pdf.js"));
      document.body.appendChild(s);
    });
  }

  async function exportPdf() {
    if (!printRef.current) return;
    try {
      await ensureHtml2Pdf();
      const html2pdf = (window as any).html2pdf;
      const opt = {
        margin: [10, 10, 10, 10], // мм
        filename: `order-${busHeader.applicationNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }, // уважаем CSS page-break
      };
      html2pdf().from(printRef.current).set(opt).save();
    } catch (e) {
      console.error(e);
      alert("Не удалось сформировать PDF. Попробуй системную печать.");
    }
  }
  // ------------------------------------------------------

  return (
    <div className="p-4">
      {/* Панель управления (не печатается) */}
      <div className="no-print mb-4 flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Назад
        </Button>
        <Button onClick={() => window.print()} disabled={loading || !baseRepair}>
          Печать
        </Button>
        <Button variant="secondary" onClick={exportPdf} disabled={loading || !baseRepair}>
          Сохранить PDF
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Загрузка…</div>
      ) : !baseRepair ? (
        <div className="text-sm text-muted-foreground">Ремонт не найден</div>
      ) : (
        // ВАЖНО: именно этот контейнер печатаем/экспортируем
        <div id="print-root" ref={printRef} className="mx-auto bg-white shadow-sm p-6 rounded-lg max-w-[210mm]">
          {/* Шапка */}
          <div className="text-center mb-4">
            <div className="text-base font-semibold">АО «Автобусный парк №1»</div>
            <div className="text-sm text-gray-600">г. Астана</div>
          </div>

          <div className="text-center mb-6">
            <div className="text-xl font-bold uppercase">ЗАКАЗ-НАРЯД</div>
            <div className="text-sm text-gray-700">
              № {busHeader.applicationNumber || "—"} от {orderDateForHeader ? fmtDate(orderDateForHeader) : "—"}
            </div>
          </div>

          {/* Информация по автобусу (без Bus ID) */}
          <table className="w-full text-sm mb-6">
            <tbody>
              <tr>
                <td className="py-1 align-top w-48 text-gray-600">Гаражный номер:</td>
                <td className="py-1">{busHeader.garageNumber}</td>
              </tr>
              <tr>
                <td className="py-1 align-top text-gray-600">Гос. номер:</td>
                <td className="py-1">{busHeader.govNumber}</td>
              </tr>
              <tr>
                <td className="py-1 align-top text-gray-600">Дата выезда в ремонт:</td>
                <td className="py-1">{fmtDate(busHeader.departureDate)}</td>
              </tr>
              <tr>
                <td className="py-1 align-top text-gray-600">Дата въезда из ремонта:</td>
                <td className="py-1">{fmtDate(busHeader.entryDate)}</td>
              </tr>
            </tbody>
          </table>

          {/* Раздел I. Работы */}
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
              {works.length === 0 ? (
                <tr>
                  <td className="border border-gray-300 p-2 text-muted-foreground" colSpan={5}>—</td>
                </tr>
              ) : (
                works.map(w => (
                  <tr key={w.id}>
                    <td className="border border-gray-300 p-2">{w.workName}</td>
                    <td className="border border-gray-300 p-2 text-right">{w.workCount ?? 0}</td>
                    <td className="border border-gray-300 p-2 text-right">{w.workHour ?? 0}</td>
                    <td className="border border-gray-300 p-2 text-right">{(w.workPrice ?? 0).toLocaleString("ru-RU")}</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {(w.workSum ?? (w.workHour || 0) * (w.workPrice || 0)).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="border border-gray-300 p-2 text-right font-medium" colSpan={4}>Итого по работам</td>
                <td className="border border-gray-300 p-2 text-right font-medium">
                  {totals.worksSum.toLocaleString("ru-RU")}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Раздел II. Запчасти */}
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
              {parts.length === 0 ? (
                <tr>
                  <td className="border border-gray-300 p-2 text-muted-foreground" colSpan={4}>—</td>
                </tr>
              ) : (
                parts.map(p => (
                  <tr key={p.id}>
                    <td className="border border-gray-300 p-2">{p.sparePart}</td>
                    <td className="border border-gray-300 p-2 text-right">{p.sparePartCount ?? 0}</td>
                    <td className="border border-gray-300 p-2 text-right">{(p.sparePartPrice ?? 0).toLocaleString("ru-RU")}</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {(p.sparePartSum ?? (p.sparePartCount || 0) * (p.sparePartPrice || 0)).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="border border-gray-300 p-2 text-right font-medium" colSpan={3}>Итого по запчастям</td>
                <td className="border border-gray-300 p-2 text-right font-medium">
                  {totals.partsSum.toLocaleString("ru-RU")}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Общие итоги */}
          <div className="flex justify-end mb-8">
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Итого по работам:</td>
                  <td className="py-1 text-right">{money(totals.worksSum)}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-gray-600">Итого по запчастям:</td>
                  <td className="py-1 text-right">{money(totals.partsSum)}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-semibold">Всего к оплате:</td>
                  <td className="py-1 text-right font-semibold">{money(totals.total)}</td>
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

      {/* Стили печати — фикс «пустого листа» */}
      <style jsx global>{`
        @media print {
          /* показываем только область печати, но через visibility — работает при любом уровне вложенности */
          body * { visibility: hidden !important; }
          #print-root, #print-root * { visibility: visible !important; }
          #print-root { position: static !important; left: 0; top: 0; }

          @page { size: A4; margin: 12mm; }

          html, body {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* переносы на новые страницы */
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-row-group; }
        }
      `}</style>
    </div>
  );
}
