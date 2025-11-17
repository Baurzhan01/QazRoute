import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { RepairRegisterApplication } from "@/types/repairBus.types";
import type { RouteExitRepairDto } from "@/types/routeExitRepair.types";
import type { RepairRecord } from "@/types/repair.types";

type PlannedRepairLookup = RepairRecord & {
  dateStart: string;
  dateEnd: string;
  busId?: string | null;
};

interface Totals {
  totalWork: number;
  totalSpare: number;
  totalAll: number;
}

interface Source {
  label: string;
  match: boolean;
}

// --- helpers ---
function fmtDate(s?: string) {
  if (!s || s === "0001-01-01") return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ru-RU");
}

function toDateOnly(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function hasDateOverlap(
  startA?: string,
  endA?: string,
  startB?: string,
  endB?: string
) {
  if (!startA || !startB) return false;
  const normalizedEndA = endA || startA;
  const normalizedEndB = endB || startB;
  return !(normalizedEndA < startB || normalizedEndB < startA);
}

// Определение источника: сход или плановый ремонт
function getSource(
  a: RepairRegisterApplication,
  exits: RouteExitRepairDto[],
  planned: PlannedRepairLookup[]
): Source {
  const depDate = toDateOnly(a.firstDepartureDate);
  if (!depDate) return { label: "—", match: false };

  const matchExit = exits.find(
    (e) => e.bus?.id === a.busId && e.startDate?.slice(0, 10) === depDate
  );
  if (matchExit) {
    return {
      label: matchExit.route?.number
        ? `Сход (маршрут ${matchExit.route.number})`
        : "Сход (резерв)",
      match: true,
    };
  }

  const appEndDate = toDateOnly(a.lastEntryDate) || depDate;

  const matchPlan = planned.find((p) => {
    const planBusId = p.busId || p.bus?.id;
    if (!planBusId || planBusId !== a.busId) return false;
    return hasDateOverlap(p.dateStart, p.dateEnd, depDate, appEndDate);
  });
  if (matchPlan) {
    const descriptionLabel = matchPlan.description?.trim()
      ? `Плановый ремонт (${matchPlan.description})`
      : "Плановый ремонт";
    return { label: descriptionLabel, match: true };
  }

  return { label: "—", match: false };
}

export async function exportRegisterToExcel(
  registerNumber: string,
  applications: RepairRegisterApplication[],
  totals: Totals,
  exits: RouteExitRepairDto[],
  planned: PlannedRepairLookup[]
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Реестр ${registerNumber}`);

  // --- Заголовок ---
  ws.mergeCells("A1:K1");
  const titleCell = ws.getCell("A1");
  titleCell.value = `Реестр ремонтов № ${registerNumber}`;
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  ws.addRow([]);

  // --- KPI ---
  ws.addRow([`Общая сумма: ${totals.totalAll.toLocaleString("ru-RU")} ₸`]);
  ws.addRow([`Работы: ${totals.totalWork.toLocaleString("ru-RU")} ₸`]);
  ws.addRow([`Запчасти: ${totals.totalSpare.toLocaleString("ru-RU")} ₸`]);
  ws.addRow([]);

  // --- Заголовок таблицы ---
  const header = [
    "№",
    "№ заявки",
    "Автобус (Гаражный/Госномер)",
    "Работы (₸)",
    "Кол-во работ",
    "Запчасти (₸)",
    "Кол-во запчастей",
    "Сумма (₸)",
    "Период",
    "Источник",
  ];
  const headerRow = ws.addRow(header);

  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2CC" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // --- Данные ---
  applications.forEach((a, idx) => {
    const source = getSource(a, exits, planned);

    const row = ws.addRow([
      idx + 1,
      a.applicationNumber,
      `${a.garageNumber || "—"} / ${a.govNumber || "—"}`,
      a.workSum,
      a.workCount,
      a.spareSum,
      a.sparePartCount,
      a.allSum,
      `${fmtDate(a.firstDepartureDate)} — ${fmtDate(a.lastEntryDate)}`,
      source.label,
    ]);

    row.eachCell((cell) => {
      // границы
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      // заливка всей строки
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: source.match ? "CCFFCC" : "FFCCCC" },
      };
    });
  });

  // --- Ширина колонок ---
  const widths = [5, 12, 25, 15, 15, 15, 18, 15, 25, 20];
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // --- Сохранение файла ---
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), `Реестр_${registerNumber}.xlsx`);
}
