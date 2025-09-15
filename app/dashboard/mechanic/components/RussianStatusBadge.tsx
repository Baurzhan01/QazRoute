import React from "react";

// Функция для перевода статуса на русский язык
const getStatusInRussian = (status: string) => {
  const statusMap: { [key: string]: string } = {
    onwork: "В работе",
    repair: "В ремонте",
    reserve: "Резерв",
    decommissioned: "Списан",

    // Дополнительные статусы
    active: "В работе",
    inactive: "Неактивный",
    in_repair: "В ремонте",
    maintenance: "Техобслуживание",
    out_of_service: "Вне эксплуатации",
    reserved: "Резерв",
    on_route: "На маршруте",
    parked: "Припаркован",
    breakdown: "Поломка",

    // Новые статусы
    longtermrepair: "Длительный ремонт",
    underrepair: "На ремонте",
  };
  return statusMap[status?.toLowerCase()] || status;
};

interface RussianStatusBadgeProps {
  status?: string | null;
}

export default function RussianStatusBadge({ status }: RussianStatusBadgeProps) {
  const originalStatus = (status || "").toLowerCase();
  const russianText = getStatusInRussian(originalStatus);

  const palette =
    originalStatus === "onwork"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : originalStatus === "repair" || originalStatus === "in_repair" || originalStatus === "underrepair"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : originalStatus === "reserve" || originalStatus === "reserved"
      ? "bg-sky-100 text-sky-700 border-sky-200"
      : originalStatus === "decommissioned"
      ? "bg-gray-100 text-gray-600 border-gray-200"
      : originalStatus === "longtermrepair"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${palette}`}
    >
      {russianText}
    </span>
  );
}
