// utils/exportRepairOrderToExcel.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Repair } from "@/types/repairBus.types";

function fmtDate(s?: string) {
  if (!s || s === "0001-01-01") return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU");
}

export async function exportRepairOrderToExcel(repairs: Repair[]) {
  if (!repairs.length) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Заказ-наряд");

  const first = repairs[0];
  const applicationNumber = first.applicationNumber || "—";

  // === Заголовок ===
  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = `Заказ-наряд № ${applicationNumber}`;
  ws.getCell("A1").font = { bold: true, size: 14 };
  ws.getCell("A1").alignment = { horizontal: "center" };

  // === Шапка автобуса ===
  ws.addRow([]);
  ws.addRow(["Гаражный №", first.garageNumber || "—"]);
  ws.addRow(["Гос. номер", first.govNumber || "—"]);
  ws.addRow(["Дата выезда", fmtDate(first.departureDate)]);
  ws.addRow(["Дата въезда", fmtDate(first.entryDate)]);

  // Немного отступа
  ws.addRow([]);

  // === Раздел I. Работы ===
  const works = repairs.filter(r => (r.workName ?? "").trim() !== "");
  ws.addRow(["Раздел I. Работы"]);
  ws.lastRow!.font = { bold: true };

  ws.addRow(["№", "Код операции", "Наименование работы", "Кол-во", "Часы", "Цена", "Сумма"]);
  works.forEach((w, idx) => {
    const sum = (w.workSum ?? (w.workHour || 0) * (w.workPrice || 0)) || 0;
    ws.addRow([
      idx + 1,
      w.workCode || "—",
      w.workName || "—",
      w.workCount ?? 0,
      w.workHour ?? 0,
      w.workPrice ?? 0,
      sum,
    ]);
  });

  const worksSum = works.reduce((s, w) => s + ((w.workSum ?? (w.workHour || 0) * (w.workPrice || 0)) || 0), 0);
  ws.addRow(["", "", "Итого по работам", "", "", "", worksSum]);

  ws.addRow([]);

  // === Раздел II. Запчасти ===
  const parts = repairs.filter(r => (r.sparePart ?? "").trim() !== "");
  ws.addRow(["Раздел II. Запасные части и материалы"]);
  ws.lastRow!.font = { bold: true };

  ws.addRow(["№", "Артикул", "Наименование", "Кол-во", "Цена", "Сумма"]);
  parts.forEach((p, idx) => {
    const sum = (p.sparePartSum ?? (p.sparePartCount || 0) * (p.sparePartPrice || 0)) || 0;
    ws.addRow([
      idx + 1,
      p.sparePartArticle || "—",
      p.sparePart || "—",
      p.sparePartCount ?? 0,
      p.sparePartPrice ?? 0,
      sum,
    ]);
  });

  const partsSum = parts.reduce((s, p) => s + ((p.sparePartSum ?? (p.sparePartCount || 0) * (p.sparePartPrice || 0)) || 0), 0);
  ws.addRow(["", "", "Итого по запчастям", "", "", partsSum]);

  ws.addRow([]);

  // === Итог ===
  ws.addRow(["Всего к оплате", worksSum + partsSum]);

  // === Стилизация ===
  ws.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), `order-${applicationNumber}.xlsx`);
}
