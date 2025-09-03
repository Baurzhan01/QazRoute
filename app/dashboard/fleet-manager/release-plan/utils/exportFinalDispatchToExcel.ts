// utils/exportFinalDispatchToExcel.ts

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type {
  FinalDispatchData,
  OrderAssignment,
  ReserveAssignmentUI,
} from "@/types/releasePlanTypes";
import { mapToReserveAssignmentUI } from "../utils/releasePlanUtils";

// (на будущее) Сокращение ФИО: Иванов И.И.
function formatShortFIO(fullName: string): string {
  const [last, first = "", middle = ""] = fullName.split(" ");
  const initials = `${first?.charAt(0)}.${middle?.charAt(0)}.`.toUpperCase();
  return `${last} ${initials}`.trim();
}

// Безопасное приведение к числу (поддержка string/number/undefined)
const num = (v: any) => {
  if (typeof v === "number") return v;
  const n = parseInt(String(v ?? ""), 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
};

export async function exportFinalDispatchToExcel(
  dateStr: string,
  depotNumber: number,
  data: FinalDispatchData,
  orders: OrderAssignment[]
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Разнарядка");

  const headerFont = { name: "Arial", size: 14, bold: true };
  const baseFont = { name: "Arial", size: 12 };

  // 🟡 Водители и автобусы
  sheet.getCell("A2").value = `Водителей: ${data.driverStatuses.total ?? "—"}`;
  sheet.getCell("A2").font = { ...baseFont, bold: true, color: { argb: "FFFFC000" } };

  sheet.getCell("A3").value = `Автобусов: ${data.routeGroups.flatMap(g => g.assignments).length}`;
  sheet.getCell("A3").font = { ...baseFont, bold: true, color: { argb: "FFFFC000" } };

  // 🟢 Заголовок по центру
  sheet.mergeCells("A4:H4");
  sheet.getCell("A4").value = `План выпуска автобусов на линию Колонна ${depotNumber} на ${new Date(
    dateStr
  ).toLocaleDateString("ru-RU")} г.`;
  sheet.getCell("A4").font = headerFont;
  sheet.getCell("A4").alignment = { horizontal: "center" };

  // 🟤 Шапка таблицы
  const headers = ["№ маршрута", "Выход", "Гар. номер", "Таб. номер"];
  const headerRow = sheet.addRow(headers);
  headerRow.font = { ...baseFont, bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  headerRow.height = 22;
  headerRow.eachCell(cell => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2CC" } };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 🟦 Основные строки (сортируем внутри каждого маршрута по возрастанию "Выход")
  for (const group of data.routeGroups) {
    const sortedAssignments = [...group.assignments].sort(
      (a, b) => num(a.busLineNumber) - num(b.busLineNumber)
    );

    for (const a of sortedAssignments) {
      const row = sheet.addRow([
        group.routeNumber,
        a.busLineNumber,
        a.garageNumber,
        a.driver?.serviceNumber ?? "",
      ]);
      row.font = baseFont;
      row.height = 22;
      row.alignment = { vertical: "middle", horizontal: "center" };
      row.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  }

  // 🟠 Резерв и заказ
  const writeReserveSection = (title: string, list: ReserveAssignmentUI[]) => {
    if (!list.length) return;
    sheet.addRow([]);
    const titleRow = sheet.addRow([title]);
    titleRow.font = { ...baseFont, bold: true };

    // по возрастанию sequenceNumber
    const sorted = [...list].sort((a, b) => num(a.sequenceNumber) - num(b.sequenceNumber));

    for (const r of sorted) {
      const row = sheet.addRow([
        "—",
        r.sequenceNumber?.toString() ?? "", // без префикса "R"
        r.garageNumber,
        r.driver?.serviceNumber ?? "",
      ]);
      row.font = baseFont;
      row.height = 22;
      row.alignment = { vertical: "middle", horizontal: "center" };
      row.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  };

  const mappedReserve = data.reserveAssignments.map((r, i) =>
    mapToReserveAssignmentUI(r, i, "Reserved")
  );
  const mappedOrders = orders.map((r, i) => mapToReserveAssignmentUI(r, i, "Order"));

  writeReserveSection("РЕЗЕРВ", mappedReserve);
  writeReserveSection("ЗАКАЗ", mappedOrders);

  // 🔠 Ширина столбцов
  const columnWidths = [14, 10, 16, 14];
  columnWidths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  const blob = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([blob]), `Разнарядка_на_${dateStr}.xlsx`);
}
