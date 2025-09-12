"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { repairBusService } from "@/service/repairBusService";
import type { Repair } from "@/types/repairBus.types";

export default function RepairPrintPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [baseRepair, setBaseRepair] = useState<Repair | null>(null);
  const [batch, setBatch] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);

  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const one = await repairBusService.getById(id);
        const current = one.value ?? null;
        setBaseRepair(current);

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

  // === html2pdf загрузка ===
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
        margin: [10, 10, 10, 10],
        filename: `order-${busHeader.applicationNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          backgroundColor: "#ffffff"
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };
      await html2pdf().set(opt).from(printRef.current).save();
    } catch (e) {
      console.error(e);
      alert("Не удалось сформировать PDF. Попробуй системную печать.");
    }
  }

  return (
    <div className="p-4">
      {/* Панель управления */}
      <div className="no-print mb-4 flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>Назад</Button>
        <Button onClick={() => window.print()} disabled={loading || !baseRepair}>Печать</Button>
        <Button variant="secondary" onClick={exportPdf} disabled={loading || !baseRepair}>Сохранить PDF</Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Загрузка…</div>
      ) : !baseRepair ? (
        <div className="text-sm text-muted-foreground">Ремонт не найден</div>
      ) : (
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

          {/* Автобус */}
          <table className="w-full text-sm mb-6">
            <tbody>
              <tr><td className="py-1 text-gray-600">Гаражный номер:</td><td>{busHeader.garageNumber}</td></tr>
              <tr><td className="py-1 text-gray-600">Гос. номер:</td><td>{busHeader.govNumber}</td></tr>
              <tr><td className="py-1 text-gray-600">Дата выезда в ремонт:</td><td>{fmtDate(busHeader.departureDate)}</td></tr>
              <tr><td className="py-1 text-gray-600">Дата въезда из ремонта:</td><td>{fmtDate(busHeader.entryDate)}</td></tr>
            </tbody>
          </table>

          {/* Раздел I. Работы */}
          <div className="font-semibold mb-2">Раздел I. Работы</div>
          <table className="w-full text-sm border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2">№</th>
                <th className="border p-2">Код операции</th>
                <th className="border p-2 text-left">Наименование работы</th>
                <th className="border p-2 text-right">Кол-во</th>
                <th className="border p-2 text-right">Часы</th>
                <th className="border p-2 text-right">Цена</th>
                <th className="border p-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {works.length === 0 ? (
                <tr><td className="border p-2 text-center text-muted-foreground" colSpan={7}>—</td></tr>
              ) : (
                works.map((w, idx) => (
                  <tr key={w.id}>
                    <td className="border p-2 text-center">{idx + 1}</td>
                    <td className="border p-2">{w.workCode || "—"}</td>
                    <td className="border p-2">{w.workName}</td>
                    <td className="border p-2 text-right">{w.workCount ?? 0}</td>
                    <td className="border p-2 text-right">{w.workHour ?? 0}</td>
                    <td className="border p-2 text-right">{(w.workPrice ?? 0).toLocaleString("ru-RU")}</td>
                    <td className="border p-2 text-right">
                      {(w.workSum ?? (w.workHour || 0) * (w.workPrice || 0)).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="border p-2 text-right font-medium" colSpan={6}>Итого по работам</td>
                <td className="border p-2 text-right font-medium">{totals.worksSum.toLocaleString("ru-RU")}</td>
              </tr>
            </tfoot>
          </table>

          {/* Раздел II. Запчасти */}
          <div className="font-semibold mb-2">Раздел II. Запасные части и материалы</div>
          <table className="w-full text-sm border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2">№</th>
                <th className="border p-2">Артикул</th>
                <th className="border p-2 text-left">Наименование</th>
                <th className="border p-2 text-right">Кол-во</th>
                <th className="border p-2 text-right">Цена</th>
                <th className="border p-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 ? (
                <tr><td className="border p-2 text-center text-muted-foreground" colSpan={6}>—</td></tr>
              ) : (
                parts.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="border p-2 text-center">{idx + 1}</td>
                    <td className="border p-2">{p.sparePartArticle || "—"}</td>
                    <td className="border p-2">{p.sparePart}</td>
                    <td className="border p-2 text-right">{p.sparePartCount ?? 0}</td>
                    <td className="border p-2 text-right">{(p.sparePartPrice ?? 0).toLocaleString("ru-RU")}</td>
                    <td className="border p-2 text-right">
                      {(p.sparePartSum ?? (p.sparePartCount || 0) * (p.sparePartPrice || 0)).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="border p-2 text-right font-medium" colSpan={5}>Итого по запчастям</td>
                <td className="border p-2 text-right font-medium">{totals.partsSum.toLocaleString("ru-RU")}</td>
              </tr>
            </tfoot>
          </table>

          {/* Итоги */}
          <div className="flex justify-end mb-8">
            <table className="text-sm">
              <tbody>
                <tr><td className="py-1 pr-4 text-gray-600">Итого по работам:</td><td>{money(totals.worksSum)}</td></tr>
                <tr><td className="py-1 pr-4 text-gray-600">Итого по запчастям:</td><td>{money(totals.partsSum)}</td></tr>
                <tr><td className="py-1 pr-4 font-semibold">Всего к оплате:</td><td className="font-semibold">{money(totals.total)}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Подписи */}
          <div className="grid grid-cols-1 gap-6 text-sm">
            <div className="flex justify-between">
              <div className="w-[48%]"><div className="text-gray-600">Механик</div><div className="mt-8 border-t border-gray-400"></div></div>
              <div className="w-[48%]"><div className="text-gray-600">Начальник колонны</div><div className="mt-8 border-t border-gray-400"></div></div>
            </div>
            <div className="flex justify-between">
              <div className="w-[48%]"><div className="text-gray-600">Водитель</div><div className="mt-8 border-t border-gray-400"></div></div>
              <div className="w-[48%]"><div className="text-gray-600">Примечание</div><div className="mt-8 border-t border-gray-400"></div></div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          table {
            border-collapse: collapse !important;
            width: 100%;
          }
          table, th, td {
            border: 0.5pt solid #000 !important;
          }
          th {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
