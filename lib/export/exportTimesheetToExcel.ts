// lib/export/exportTimesheetToExcel.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { TimesheetRow } from "@/hooks/useTimesheet";
import { dayLabel } from "@/lib/utils/timesheet";

export async function exportTimesheetToExcel({
  rows,
  days,
  year,
  month0,
  convoyNumber,
}: {
  rows: TimesheetRow[];
  days: number[];
  year: number;
  month0: number;
  convoyNumber?: string | number;
}) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Табель");

  const monthName = new Date(year, month0, 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  ws.mergeCells(1, 1, 1, 5 + days.length);
  ws.getCell(1, 1).value = `Табель рабочего времени — автоколонна №${convoyNumber ?? "—"} — ${monthName}`;
  ws.getCell(1, 1).alignment = { horizontal: "center" };
  ws.getCell(1, 1).font = { bold: true, size: 14 };

  // Заголовок
  const header = ["ФИО", "Табельный №", ...days.map(String), "Итого Р", "Итого В", "Отпуск", "Больничный", "Стажировка", "Уволен"];
  ws.addRow(header);
  ws.getRow(2).font = { bold: true };

  // Данные
  rows.forEach((r) => {
    const row = [
      r.driver.fullName,
      r.driver.serviceNumber ?? "",
      ...days.map((d) => dayLabel[r.days[d]?.status || "Empty"]),
      r.totals.worked,
      r.totals.dayOff,
      r.totals.vacation,
      r.totals.sick,
      r.totals.intern,
      r.totals.fired,
    ];
    ws.addRow(row);
  });

  ws.columns = [
    { width: 30 }, // ФИО
    { width: 14 }, // Таб №
    ...days.map(() => ({ width: 4 })),
    { width: 8 }, { width: 8 }, { width: 8 }, { width: 10 }, { width: 10 }, { width: 8 },
  ];

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), `Табель_${convoyNumber ?? "—"}_${month0 + 1}-${year}.xlsx`);
}
